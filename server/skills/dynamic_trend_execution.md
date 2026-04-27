**This skill provides an autonomous agent with the logic required to execute trades by reacting to market momentum through ****Moving Average Crossovers** while utilizing **ADX and EMA filters** to ensure execution only occurs during strong, established trends.

**Skill Name: Dynamic Trend Execution (Adaptive Crossovers & Filters)**

**1. Triggering Logic: Moving Average Crossover System**

**The agent identifies potential entry points based on the interplay between fast and slow-moving averages to capture random price changes and trend shifts**.

* **Dual MA Strategy:** The agent compares a **fast moving average** (e.g., 22-day) against a **slow moving average** (e.g., 34-day)**. A ****BUY signal** is generated when the fast MA crosses above the slow MA, and a **SELL signal** is triggered when it crosses below**.**
* **Triple MA Confirmation:** For increased accuracy, the agent can implement a three-line system (20, 60, and 100 periods)**. If price bars remain consistently above the ** **100-period trend indicator** **, a strong trend is confirmed, and the agent is instructed to let the trade run**.

**2. Adaptive Strength & Direction Filters**

**To reduce "false signals" common in ranging (sideways) markets, the agent must validate the trade using the following filters:**

* **ADX Strength Filter:** The agent checks the **Average Directional Index (ADX)** to determine if a market is trending or merely trading back and forth within a range**. Trades are only initiated if the ****ADX value is greater than 20** (indicating a developing trend) or **above 25** (confirming a genuine trend)**.**
* **Directional Confirmation (DMI):** The agent validates the direction using the **Positive Directional Index (+DI)** and **Negative Directional Index (-DI)**. For long positions, the **+DI must be greater than -DI**.
* **EMA Directional Filter:** Before executing, the agent ensures the current price is **above a 14-period Exponential Moving Average (EMA)** for buy entries**.**

**3. Price Action Execution ("Smoothies")**

**The agent fine-tunes the entry and exit points within the broader trend by identifying ****support and resistance zones**.

* **Support/Resistance Entries:** Using forward-projecting trendlines, the agent attempts to purchase stock when the price drops to the **support trendline** and sell when it reaches the **resistance trendline**.
* **Smoothing Profits:** This "smoothies" method allows the agent to exploit sharp price changes within a larger trend, optimally timing trades to capture small profit improvements**.**

**4. Automated Risk & Exit Protocol**

**To prevent emotional interference and preserve capital, the agent follows a strict mathematical exit logic**.

* **EMA Exit Signal:** The agent exits a long position immediately when the price **breaks down below the 14-period EMA** on a candle-close basis**.**
* **Trailing Stop Loss:** As the stock moves in a favorable direction, the agent utilizes a **Trailing Stop Loss** to lock in profits and minimize potential losses from sudden market reversals**.**
* **Risk/Reward Ratio:** The agent is restricted to trades with a minimum **Risk/Reward Ratio of 1:2**.

**By combining these technical indicators, the agent avoids "overfitting" while maintaining the flexibility to trade both price runs and periods of volatility**
