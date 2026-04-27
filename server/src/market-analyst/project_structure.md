project_root/
├── src/
│   └── market_analyst/
│       ├── __init__.py
│       ├── cli.py
│       ├── config/
│       │   ├── __init__.py
│       │   └── settings.py
│       ├── services/
│       │   ├── __init__.py
│       │   ├── fetcher/
│       │   │   ├── __init__.py
│       │   │   └── fetcher.py
│       │   ├── indicators/
│       │   │   ├── __init__.py
│       │   │   ├── engine.py
│       │   │   └── implementations/
│       │   │       ├── ema.py
│       │   │       ├── rsi.py
│       │   │       └── atr.py
│       │   ├── signals/
│       │   │   ├── __init__.py
│       │   │   ├── evaluator.py
│       │   │   └── rules/
│       │   ├── predictor/
│       │   │   ├── __init__.py
│       │   │   ├── features.py
│       │   │   ├── trainer.py
│       │   │   └── infer.py
│       │   ├── backtester/
│       │   │   ├── __init__.py
│       │   │   ├── runner.py
│       │   │   └── metrics.py
│       │   ├── risk/
│       │   │   └── manager.py
│       │   └── storage/
│       │       ├── __init__.py
│       │       ├── timescale_adapter.py
│       │       └── vectorstore_adapter.py
│       ├── models/
│       │   ├── __init__.py
│       │   ├── market.py
│       │   ├── indicator.py
│       │   ├── signal.py
│       │   └── prediction.py
│       ├── agent/
│       │   ├── __init__.py
│       │   ├── tools.py
│       │   ├── prompts.py
│       │   └── orchestrator.py
│       └── utils/
│           ├── logging.py
│           ├── telemetry.py
│           └── versioning.py
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── infra/
│   ├── docker-compose.yml
│   ├── docker/
│   └── migrations/
├── ops/
│   ├── ci/
│   └── scripts/
├── docs/
│   ├── architecture.md
│   ├── data_schema.md
│   └── runbook.md
├── notebooks/
├── data/
│   ├── raw/
│   └── processed/
├── .env.example
├── pyproject.toml
├── Makefile
└── README.md