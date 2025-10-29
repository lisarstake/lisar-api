# Earner Leaderboard with Time Filtering

The earner leaderboard endpoint now supports optional time filtering to analyze performance over specific periods.

## Endpoint

`GET /earners/leaderboard`

## Usage Examples

### 1. Regular Leaderboard (Lifetime Data)
```
GET /earners/leaderboard?limit=10&orderBy=bondedAmount&orderDirection=desc
```
Returns lifetime statistics for all registered users.

### 2. Weekly Leaderboard
```
GET /earners/leaderboard?timePeriod=weekly&orderBy=periodRewards&limit=10
```
Returns rewards and activity data for the last 7 days.

### 3. Monthly Leaderboard
```
GET /earners/leaderboard?timePeriod=monthly&orderBy=periodRewards&limit=10
```
Returns rewards and activity data for the last 30 days.

### 4. Daily Leaderboard
```
GET /earners/leaderboard?timePeriod=daily&orderBy=periodRewards&limit=10
```
Returns rewards and activity data for the last 24 hours.

### 5. Custom Period Leaderboard
```
GET /earners/leaderboard?timePeriod=custom&startDate=2023-01-01&endDate=2023-01-31&orderBy=periodRewards
```
Returns rewards and activity data for a specific date range.

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 100 | Number of earners to return (1-1000) |
| `offset` | integer | 0 | Number of earners to skip for pagination |
| `orderBy` | string | bondedAmount | Field to sort by* |
| `orderDirection` | string | desc | Sort direction (asc/desc) |
| `timePeriod` | string | - | Optional time period (daily/weekly/monthly/custom) |
| `startDate` | string | - | Start date for custom period (YYYY-MM-DD) |
| `endDate` | string | - | End date for custom period (YYYY-MM-DD) |

### Valid `orderBy` Values

**Without Time Filtering:**
- `bondedAmount` - Total bonded LPT
- `lifetimeReward` - Total lifetime rewards
- `delegatedAmount` - Total delegated amount

**With Time Filtering:**
- `periodRewards` - Rewards earned in the specified period
- `periodBondingActivity` - Bonding activity in the specified period
- `bondedAmount` - Total bonded LPT (lifetime)
- `lifetimeReward` - Total lifetime rewards
- `delegatedAmount` - Total delegated amount

## Response Structure

### Without Time Filtering
```json
{
  "success": true,
  "data": {
    "earners": [
      {
        "rank": 1,
        "address": "0x742d35Cc6634C0532925a3b8C6Cd1d31F03e46F6",
        "email": "user@example.com",
        "full_name": "John Doe",
        "bondedAmount": "1000.5",
        "lifetimeReward": "125.75",
        "delegatedAmount": "5000.0",
        "lastClaimRound": "2890",
        "delegate": {
          "address": "0x123...",
          "feeShare": "50000",
          "rewardCut": "100000"
        }
      }
    ],
    "pagination": {
      "limit": 100,
      "offset": 0,
      "total": 250
    }
  }
}
```

### With Time Filtering
```json
{
  "success": true,
  "data": {
    "earners": [
      {
        "rank": 1,
        "address": "0x742d35Cc6634C0532925a3b8C6Cd1d31F03e46F6",
        "email": "user@example.com",
        "full_name": "John Doe",
        "bondedAmount": "1000.5",
        "lifetimeReward": "125.75",
        "delegatedAmount": "5000.0",
        "lastClaimRound": "2890",
        "delegate": {
          "address": "0x123...",
          "feeShare": "50000",
          "rewardCut": "100000"
        },
        "periodRewards": "45.25",
        "periodBondingActivity": "100.0",
        "rewardEvents": 12,
        "bondEvents": 3,
        "topDelegate": "0x123...abc"
      }
    ],
    "period": {
      "startTimestamp": 1640995200,
      "endTimestamp": 1641600000,
      "description": "Last 7 days"
    },
    "pagination": {
      "limit": 100,
      "offset": 0,
      "total": 45
    }
  }
}
```

## Key Features

1. **Backwards Compatible**: Without `timePeriod` parameter, returns traditional lifetime data
2. **Flexible Time Periods**: Daily, weekly, monthly, or custom date ranges
3. **Event-Based Analysis**: Period rewards based on actual reward events, not cumulative totals
4. **Additional Metrics**: When time filtering is enabled, includes:
   - `periodRewards`: Rewards earned during the period
   - `periodBondingActivity`: Bonding activity during the period
   - `rewardEvents`: Number of reward events
   - `bondEvents`: Number of bond events
   - `topDelegate`: Delegate that generated the most rewards
5. **Period Information**: Returns metadata about the time period analyzed
6. **Enhanced Sorting**: Can sort by period-specific metrics when time filtering is active

## Use Cases

- **Weekly Competitions**: Track who earned the most rewards this week
- **Performance Analysis**: Compare user activity across different time periods
- **Seasonal Reports**: Generate monthly or quarterly performance reports
- **Real-time Tracking**: Monitor daily activity and rewards
- **Historical Analysis**: Analyze performance during specific date ranges
