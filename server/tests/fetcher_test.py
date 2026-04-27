import json
from datetime import datetime, timezone
import hashlib
import pandas as pd
import builtins
import types
from market_analyst.services.fetcher.fetcher import  FetcherRequest,MarketRow

import pytest

from market_analyst.services.fetcher.fetcher import (
    _params_hash,
    _row_hash,
    _slice_df_by_range,
    normalize_av_df,
    _fetch_av_daily,
)


SAMPLE_AV_JSON = {
    "Meta Data": {"1. Information": "FX Daily Time Series"},
    "Time Series FX (Daily)": {
        "2024-01-03": {
            "1. open": "130.0000",
            "2. high": "131.0000",
            "3. low": "129.5000",
            "4. close": "130.7500"
        },
        "2024-01-02": {
            "1. open": "129.5000",
            "2. high": "130.5000",
            "3. low": "129.2000",
            "4. close": "130.0000"
        }
    }
}

class FakeResponse:
    def __init__(self, payload, status=200):
        self._payload = payload
        self.status_code = status

    def raise_for_status(self):
        if not (200 <= self.status_code < 300):
            raise Exception(f"HTTP status {self.status_code}")

    def json(self):
        return self._payload

def test_params_hash_is_stable_and_changes_with_params():
    a = {"symbols": ["USD/JPY"], "start": "2024-01-01", "end": "2024-02-01"}
    b = {"end": "2024-02-01", "start": "2024-01-01", "symbols": ["USD/JPY"]}
    h1 = _params_hash(a)
    h2 = _params_hash(b)
    assert h1 == h2
    c = dict(a)
    c["end"] = "2024-03-01"
    assert _params_hash(c) != h1

def test_row_hash_is_deterministic():
    ts = pd.Timestamp("2024-01-02T00:00:00Z")
    h1 = _row_hash("USD/JPY", ts, 130.0)
    h2 = _row_hash("USD/JPY", ts, 130.0)
    assert isinstance(h1, str) and len(h1) == 64
    assert h1 == h2
    h3 = _row_hash("USD/JPY", ts, 130.1)
    assert h3 != h1

def test_slice_df_by_range_inclusive_bounds():
    idx = pd.to_datetime(["2024-01-01", "2024-01-02", "2024-01-03"], utc=True)
    df = pd.DataFrame({"open": [1,2,3]}, index=idx)
    start = datetime(2024,1,2, tzinfo=timezone.utc)
    end = datetime(2024,1,3, tzinfo=timezone.utc)
    sl = _slice_df_by_range(df, start, end)
    assert len(sl) == 2
    assert sl.index[0] == pd.Timestamp("2024-01-02T00:00:00Z")

def test_normalize_av_df_creates_marketrows_and_hashes():
    df = pd.DataFrame.from_dict({
        "open": {"2024-01-02": "129.5", "2024-01-03": "130.0"},
        "high": {"2024-01-02": "130.5", "2024-01-03": "131.0"},
        "low": {"2024-01-02": "129.2", "2024-01-03": "129.5"},
        "close": {"2024-01-02": "130.0", "2024-01-03": "130.75"},
        "volume": {"2024-01-02": 0.0, "2024-01-03": 0.0}
    })
    df.index = pd.to_datetime(df.index, utc=True)
    rows = normalize_av_df("USD/JPY", df, source="alphavantage")
    assert isinstance(rows, list)
    assert len(rows) == 2
    r0 = rows[0]
    assert r0.symbol == "USD/JPY"
    assert r0.close == 130.0
    assert r0.row_hash is not None and len(r0.row_hash) == 64

def test_fetch_av_daily_parses_json(monkeypatch):
    def fake_get(url, params=None, timeout=None):
        return FakeResponse(SAMPLE_AV_JSON, status=200)

    monkeypatch.setattr("market_analyst.services.fetcher.fetcher.httpx.get", fake_get)
    df = _fetch_av_daily("USD/JPY")
    assert isinstance(df, pd.DataFrame)
    assert "open" in df.columns and "close" in df.columns
    assert df.index.is_monotonic_increasing
    assert abs(float(df.loc[pd.Timestamp("2024-01-02", tz="UTC")]["open"]) - 129.5) < 1e-6
    assert abs(float(df.loc[pd.Timestamp("2024-01-03", tz="UTC")]["close"]) - 130.75) < 1e-6

def test_fetch_av_daily_raises_on_unexpected_payload(monkeypatch):
    def fake_get_bad(url, params=None, timeout=None):
        return FakeResponse({"Note": "API call frequency exceeded"}, status=200)
    monkeypatch.setattr("market_analyst.services.fetcher.fetcher.httpx.get", fake_get_bad)
    with pytest.raises(Exception):
        _fetch_av_daily("USD/JPY")