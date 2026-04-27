import os
import uuid
import hashlib
import time
from datetime import datetime, timezone
from typing import List, Dict, Any
import httpx
import pandas as pd
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("ALPHAVANTAGE_KEY")
DB_URL = os.getenv("DB_URL")  
SNAPSHOT_DIR = os.getenv("SNAPSHOT_DIR", "data/raw")
os.makedirs(SNAPSHOT_DIR, exist_ok=True)
class FetcherRequest(BaseModel):
    symbols: List[str]
    start: datetime
    end: datetime
    granularity: str  # "daily" | "hourly" | "minute"
    source: str | None = "alphavantage"
    force_refresh: bool = False

class MarketRow(BaseModel):
    symbol: str
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float
    source: str
    received_at: datetime
    row_hash: str

def _params_hash(payload: Dict[str, Any]) -> str:
    h = hashlib.sha256(repr(sorted(payload.items())).encode())
    return h.hexdigest()

def _row_hash(symbol: str, ts: pd.Timestamp, close: float) -> str:
    s = f"{symbol}|{ts.isoformat()}|{close}"
    return hashlib.sha256(s.encode()).hexdigest()

def _engine() -> Engine:
    return create_engine(DB_URL, pool_pre_ping=True)

AV_BASE = "https://www.alphavantage.co/query"

@retry(wait=wait_exponential(multiplier=1, min=1, max=30),
       stop=stop_after_attempt(5),
       retry=retry_if_exception_type(httpx.HTTPError))
def _fetch_av_daily(symbol: str) -> pd.DataFrame:
    from_sym, to_sym = symbol.split("/")
    params = {
        "function": "FX_DAILY",
        "from_symbol": from_sym,
        "to_symbol": to_sym,
        "apikey": ALPHAVANTAGE_KEY,
        "outputsize": "full",
        "datatype": "json",
    }
    r = httpx.get(AV_BASE, params=params, timeout=30.0)
    r.raise_for_status()
    j = r.json()
    if "Time Series FX (Daily)" not in j:
        raise httpx.HTTPError(f"unexpected response from alphavantage: {j.get('Note') or j.get('Error Message') or str(j)[:200]}")
    ts = j["Time Series FX (Daily)"]
    df = pd.DataFrame.from_dict(ts, orient="index")
    df = df.rename(columns={
        "1. open": "open",
        "2. high": "high",
        "3. low": "low",
        "4. close": "close",
    })
    df.index = pd.to_datetime(df.index, utc=True)
    df = df.sort_index()
    df["volume"] = 0.0
    df = df.astype({"open": float, "high": float, "low": float, "close": float, "volume": float})
    df.index.name = "timestamp"
    return df

def _slice_df_by_range(df: pd.DataFrame, start: datetime, end: datetime) -> pd.DataFrame:
    start = pd.to_datetime(start).tz_convert("UTC") if hasattr(start, "tzinfo") else pd.to_datetime(start).tz_localize("UTC")
    end = pd.to_datetime(end).tz_convert("UTC") if hasattr(end, "tzinfo") else pd.to_datetime(end).tz_localize("UTC")
    return df.loc[(df.index >= start) & (df.index <= end)]

def normalize_av_df(symbol: str, df: pd.DataFrame, source: str = "alphavantage") -> List[MarketRow]:
    rows = []
    received_at = datetime.now(timezone.utc)
    for ts, r in df.iterrows():
        row_hash = _row_hash(symbol, ts, float(r["close"]))
        mr = MarketRow(
            symbol=symbol,
            timestamp=ts.to_pydatetime(),
            open=float(r["open"]),
            high=float(r["high"]),
            low=float(r["low"]),
            close=float(r["close"]),
            volume=float(r.get("volume", 0.0)),
            source=source,
            received_at=received_at,
            row_hash=row_hash,
        )
        rows.append(mr)
    return rows

def upsert_market_rows(engine: Engine, rows: List[MarketRow], batch_size: int = 500):
    if not rows:
        return {"ingested": 0, "updated": 0, "skipped": 0}
    df = pd.DataFrame([r.dict() for r in rows])
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    conn = engine.connect()
    trans = conn.begin()
    try:
        tmp_table = "staging_market_data"
        conn.execute(text(f"""
            CREATE TEMP TABLE {tmp_table} (
                symbol text,
                timestamp timestamptz,
                open double precision,
                high double precision,
                low double precision,
                close double precision,
                volume double precision,
                source text,
                received_at timestamptz,
                row_hash text
            ) ON COMMIT DROP;
        """))
        for i in range(0, len(df), batch_size):
            chunk = df.iloc[i:i+batch_size]
            chunk.to_sql(tmp_table, con=conn.engine, if_exists="append", index=False, method="multi")

        upsert_sql = f"""
            INSERT INTO market_data (symbol, timestamp, open, high, low, close, volume, source, received_at, row_hash)
            SELECT symbol, timestamp, open, high, low, close, volume, source, received_at, row_hash FROM {tmp_table}
            ON CONFLICT (symbol, timestamp) DO UPDATE
            SET open = EXCLUDED.open,
                high = EXCLUDED.high,
                low = EXCLUDED.low,
                close = EXCLUDED.close,
                volume = EXCLUDED.volume,
                source = EXCLUDED.source,
                received_at = EXCLUDED.received_at,
                row_hash = EXCLUDED.row_hash
            ;
        """
        result = conn.execute(text(upsert_sql))
        trans.commit()
        return {"ingested": len(rows), "updated": None, "skipped": 0}
    except Exception:
        trans.rollback()
        raise
    finally:
        conn.close()
def write_snapshot_parquet(rows: List[MarketRow], snapshot_path: str):
    df = pd.DataFrame([r.dict() for r in rows])
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df.to_parquet(snapshot_path, index=False)

def fetch_and_persist(request: FetcherRequest) -> Dict[str, Any]:
    job_id = str(uuid.uuid4())
    params_hash = _params_hash(request.dict())
    start_t = time.time()
    stats = {"requested_rows": 0, "ingested_count": 0, "updated_count": 0, "skipped_count": 0, "errors": 0}
    engine = _engine()
    all_rows: List[MarketRow] = []
    for symbol in request.symbols:
        try:
            if request.granularity != "daily":
                raise NotImplementedError("Only daily supported in this adapter MVP")
            df = _fetch_av_daily(symbol)
            df = _slice_df_by_range(df, request.start, request.end)
            rows = normalize_av_df(symbol, df, source=request.source or "alphavantage")
            all_rows.extend(rows)
            stats["requested_rows"] += len(rows)
        except Exception as e:
            stats["errors"] += 1
            print(f"[fetcher] error fetching {symbol}: {e}")
    snapshot_name = f"{snapshot_path := os.path.join(SNAPSHOT_DIR, f'snapshot-{job_id}.parquet')}"
    if all_rows:
        write_snapshot_parquet(all_rows, snapshot_name)
    try:
        upsert_res = upsert_market_rows(engine, all_rows)
        stats["ingested_count"] = upsert_res.get("ingested", 0)
    except Exception as e:
        stats["errors"] += 1
        print(f"[fetcher] error upserting rows: {e}")
        raise
    duration = time.time() - start_t
    return {
        "job_id": job_id,
        "params_hash": params_hash,
        "stats": stats,
        "rows_sample": [r.dict() for r in all_rows[:1]],
        "snapshot_uri": snapshot_name,
        "metadata": {
            "adapter_name": "alphavantage_adapter",
            "source_version": "v1",
            "fetched_at": datetime.now(timezone.utc).isoformat(),
        },
        "duration_seconds": duration,
    }

if __name__ == "__main__":
    req = FetcherRequest(
        symbols=["USD/JPY"],
        start=datetime(2024, 1, 1, tzinfo=timezone.utc),
        end=datetime(2024, 12, 31, tzinfo=timezone.utc),
        granularity="daily",
    )
    out = fetch_and_persist(req)
    print(out)