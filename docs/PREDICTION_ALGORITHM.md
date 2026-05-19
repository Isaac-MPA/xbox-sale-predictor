# Prediction Algorithm Documentation

## Overview

The Xbox Sale Predictor uses a statistical analysis engine combined with machine learning principles to predict when games will go on sale and estimate discount percentages.

## Algorithm Components

### 1. Historical Data Analysis

The algorithm collects and analyzes historical pricing data:

```
Price History Table:
┌─────────────┬────────┬──────────────┐
│    Date     │ Price  │   Discount   │
├─────────────┼────────┼──────────────┤
│ 2024-01-15  │ $59.99 │      0%      │
│ 2024-02-20  │ $29.99 │     50%      │
│ 2024-04-10  │ $59.99 │      0%      │
│ 2024-05-15  │ $19.99 │     67%      │
│ 2024-07-01  │ $59.99 │      0%      │
│ 2024-08-05  │ $24.99 │     58%      │
└─────────────┴────────┴──────────────┘
```

### 2. Sale Interval Calculation

The algorithm calculates the days between sales:

```
Sale Intervals:
- Sale 1 to Sale 2: 36 days
- Sale 2 to Sale 3: 50 days
- Sale 3 to Sale 4: 48 days
- Sale 4 to Sale 5: 41 days

Average Interval: (36 + 50 + 48 + 41) / 4 = 43.75 days
```

### 3. Discount Pattern Analysis

Analyzes discount percentages for consistency:

```
Discount Percentages:
- Sale 1: 50%
- Sale 2: 67%
- Sale 3: 58%
- Sale 4: 60% (predicted)

Average Discount: (50 + 67 + 58 + 60) / 4 = 58.75%
Standard Deviation: Used to calculate confidence
```

### 4. Seasonal Pattern Detection

Identifies recurring seasonal trends:

```
Month Distribution of Sales:
- December (Holiday): 4 sales
- July (Summer): 3 sales
- February (Valentine's): 2 sales

Most Common Season: Holiday → Higher seasonal weight
```

### 5. Confidence Score Calculation

The confidence score (0-100) is calculated using:

```typescript
confidence = frequencyScore + consistencyScore

frequencyScore = min(totalSales × 10, 50)
// More sales = higher confidence, max 50 points

consistencyScore = max(0, 50 - (stdDev / avgInterval × 10))
// More consistent intervals = higher confidence

Final Confidence Range:
- 0-33%: Low confidence (unreliable prediction)
- 34-66%: Medium confidence (reasonable prediction)
- 67-100%: High confidence (reliable prediction)
```

### 6. Next Sale Date Prediction

```
Last Sale Date: 2024-08-05
Average Interval: 43.75 days
Seasonal Adjustment: +5 days (holiday approaching)

Next Sale Date = 2024-08-05 + (43.75 + 5) = 2024-09-24
```

### 7. Estimated Discount Calculation

```
Base Price (Max): $59.99
Average Discount: 58.75%
Estimated Sale Price = $59.99 × (1 - 0.5875) = $24.74
```

## Algorithm Pseudocode

```python
def calculate_prediction(game_id):
    # 1. Fetch price history
    price_history = get_price_history(game_id)
    
    # 2. Filter sales (discount > 0)
    sales = filter(price_history, discount > 0)
    
    if len(sales) < 2:
        raise InsufficientDataError()
    
    # 3. Calculate intervals
    intervals = calculate_intervals(sales)
    avg_interval = mean(intervals)
    
    # 4. Calculate discount stats
    discounts = [s.discount for s in sales]
    avg_discount = mean(discounts)
    
    # 5. Detect seasonal pattern
    seasonal_pattern = detect_seasonality(sales)
    seasonal_adjustment = get_adjustment(seasonal_pattern)
    
    # 6. Calculate confidence
    frequency_score = min(len(sales) * 10, 50)
    variance = calculate_variance(intervals, avg_interval)
    std_dev = sqrt(variance)
    consistency_score = max(0, 50 - (std_dev / avg_interval * 10))
    confidence = frequency_score + consistency_score
    
    # 7. Predict next sale
    last_sale = sales[-1].date
    adjusted_interval = avg_interval + seasonal_adjustment
    next_sale_date = last_sale + adjusted_interval
    
    # 8. Estimate price
    base_price = max(price_history).price
    estimated_price = base_price * (1 - avg_discount / 100)
    
    return Prediction(
        next_sale_date=next_sale_date,
        estimated_discount=avg_discount,
        estimated_price=estimated_price,
        confidence=min(confidence, 100),
        metadata={
            total_sales: len(sales),
            avg_interval: avg_interval,
            volatility: std_dev,
            seasonal_pattern: seasonal_pattern
        }
    )
```

## Example Calculation

**Game: Halo Infinite**

### Step 1: Price History (Last 12 months)

```
Date        Price    Discount
2023-09-20  $59.99   0%
2023-10-15  $29.99   50%
2023-12-20  $19.99   67%
2024-01-15  $59.99   0%
2024-02-14  $24.99   58%
2024-04-01  $59.99   0%
2024-05-10  $29.99   50%
2024-06-20  $59.99   0%
2024-07-20  $19.99   67%
```

### Step 2: Identify Sales

```
Sales (discount > 0):
1. 2023-10-15: 50% ($29.99)
2. 2023-12-20: 67% ($19.99)
3. 2024-02-14: 58% ($24.99)
4. 2024-05-10: 50% ($29.99)
5. 2024-07-20: 67% ($19.99)
```

### Step 3: Calculate Intervals

```
Intervals (days between sales):
1→2: 66 days
2→3: 56 days
3→4: 86 days
4→5: 71 days

Average: (66 + 56 + 86 + 71) / 4 = 69.75 days
Standard Deviation: 12.56
```

### Step 4: Calculate Metrics

```
Discounts: [50, 67, 58, 50, 67]
Average Discount: (50 + 67 + 58 + 50 + 67) / 5 = 58.4%

Price Volatility: $2.15 (calculated)

Base Price (Maximum): $59.99
```

### Step 5: Detect Seasonality

```
Sale Months:
- October: 1 sale
- December: 1 sale (Holiday season indicator)
- February: 1 sale (Valentine's/President's Day)
- May: 1 sale
- July: 1 sale (Summer)

Pattern: Distributed across seasons
Adjustment: +3 days (slight holiday lean)
```

### Step 6: Calculate Confidence

```
Frequency Score: min(5 × 10, 50) = 50
Coefficient of Variation: 12.56 / 69.75 = 0.18
Consistency Score: max(0, 50 - (0.18 × 10)) = 48.2

Total Confidence: 50 + 48.2 = 98.2% → 98%

(Interpretation: Very high confidence due to consistent sales)
```

### Step 7: Predict Next Sale

```
Last Sale: 2024-07-20
Adjusted Interval: 69.75 + 3 = 72.75 days

Next Sale Date: 2024-07-20 + 73 days = 2024-09-22
```

### Step 8: Estimate Price

```
Base Price: $59.99
Estimated Discount: 58.4%

Estimated Sale Price: $59.99 × (1 - 0.584) = $25.04
```

### Final Prediction

```json
{
  "nextSaleDate": "2024-09-22",
  "estimatedDiscount": 58.4,
  "estimatedPrice": 25.04,
  "confidence": 98,
  "analysisMetadata": {
    "totalSales": 5,
    "avgInterval": 69.75,
    "priceVolatility": 2.15,
    "seasonalPattern": "distributed"
  }
}
```

## Accuracy Factors

### High Confidence Factors:
- ✅ Frequent sales (5+ sales)
- ✅ Consistent sale intervals (low standard deviation)
- ✅ Clear seasonal patterns
- ✅ Sufficient historical data (6+ months)

### Low Confidence Factors:
- ❌ Few sales (<3 sales)
- ❌ Inconsistent intervals (high standard deviation)
- ❌ New games (limited history)
- ❌ Major price changes after sales

## Future Improvements

1. **Machine Learning Integration**
   - Neural networks for pattern recognition
   - Time series analysis with LSTM
   - XGBoost for feature importance

2. **Real-time Data Feeds**
   - Live Xbox Store API integration
   - Competitor price tracking
   - Social media trend analysis

3. **Enhanced Seasonality**
   - Holiday calendars (Black Friday, Cyber Monday)
   - Game release cycles
   - Publisher-specific patterns

4. **User Behavior Integration**
   - Wishlist popularity metrics
   - Search trend correlation
   - User feedback and ratings

## References

- Time Series Analysis: https://en.wikipedia.org/wiki/Time_series
- Moving Averages: https://en.wikipedia.org/wiki/Moving_average
- Standard Deviation: https://en.wikipedia.org/wiki/Standard_deviation
- Seasonal Decomposition: https://en.wikipedia.org/wiki/Seasonal_adjustment
