# Financial AI Analyst 🤖📈

A sophisticated agentic trading system built with **LangGraph**, **FastAPI**, and **React**. This project uses a multi-agent architecture to provide technical analysis, trading strategies, and deep reasoning for Forex and financial markets, powered by local AI models.

---

## 🏗️ Architecture

The project is divided into a specialized client-server architecture:

### 1. Backend (`/server`) - Agentic Intelligence
A multi-agent system built with **LangGraph** that selects the best specialized agent based on the user's query:

- **⚡ Simple Agent**: Fast responses (< 2s) for conceptual questions (e.g., "¿Qué es el RSI?"). No tools used.
- **🔮 Main Agent**: Quantitative analysis using specialized tools for risk management and Kelly Criterion.
- **🤖 ReAct Agent**: Deep reasoning and evaluation of trading predictions with step-by-step logic.

**Key Technologies:** Python, FastAPI, LangChain, LangGraph, LM Studio (Phi-4-mini).

### 2. Frontend (`/client`) - Pro Dashboard
A modern, responsive trading dashboard focused on user experience and real-time interaction.

**Key Technologies:** React, TypeScript, Vite, Tailwind CSS, Shadcn/UI, Lucide React, Supabase.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **Python** (3.10+)
- **LM Studio** (for running the local LLM)

### 1. Backend Setup
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure `.env`:
   ```env
   MODEL="microsoft/phi-4-mini-reasoning"
   URL="http://localhost:1234/v1"
   TEMPERATURE=0.7
   ```
5. Run the API:
   ```bash
   python src/main_api.py
   ```

### 2. Frontend Setup
1. Navigate to the client folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run development server:
   ```bash
   npm run dev
   ```

### 3. AI Server (LM Studio)
1. Open **LM Studio**.
2. Download and load `microsoft/phi-4-mini-reasoning` (or any compatible model).
3. Start the Local Inference Server on port **1234**.

---

## 🛠️ Specialized Tools
The agents have access to a suite of quantitative trading tools:
- **Win Calculator**: Precise calculation of potential gains.
- **Risk Manager**: Calculates maximum drawdown and capital exposure.
- **Kelly Criterion**: Determines optimal position sizing based on win rate and risk/reward ratio.

---

## 📊 Project Structure
```text
Financial_AI_Analyst/
├── client/              # React Dashboard
│   ├── src/pages/       # AIChat, Backtesting, News
│   └── src/components/  # Shadcn UI Components
├── server/              # Python Intelligence
│   ├── src/main2.py     # LangGraph Orchestrator
│   ├── src/agent.py     # Main Agent Logic
│   └── src/main_api.py  # FastAPI Entry Point
└── README.md
```

---

## 📝 License
This project is licensed under the Apache-2.0 License.

Developed with ❤️ for the Trading Community.