# LPT Yield Calculator API

This endpoint calculates projected rewards for LPT delegation based on the compound interest formula used in the React component, taking into account Livepeer's specific round duration and compounding schedule.

## Endpoint

`POST /delegation/calculate-yield`

## Authentication

Requires Bearer token authentication.

## Request Body

```json
{
  "amount": 1000,
  "apy": "5.2%",
  "period": "1 year",
  "includeCurrencyConversion": true,
  "currency": "USD"
}
```

### Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `amount` | number | Yes | Initial LPT amount to delegate | `1000` |
| `apy` | string/number | Yes | Annual Percentage Yield (can be "5.2%" or 5.2) | `"5.2%"` or `5.2` |
| `period` | string | Yes | Time period for calculation | `"1 year"` |
| `includeCurrencyConversion` | boolean | No | Include market value conversion | `true` |
| `currency` | string | No | Currency for conversion (USD/EUR/GBP) | `"USD"` |

### Valid Periods
- `"1 day"`
- `"1 week"`
- `"1 month"`
- `"6 months"`
- `"1 year"`

## Response

### Success Response (without currency conversion)

```json
{
  "success": true,
  "data": {
    "initialAmount": 1000,
    "finalAmount": 1053.4,
    "rewardAmount": 53.4,
    "apy": 5.2,
    "period": "1 year",
    "compoundingPeriods": 403.7,
    "periodicRate": 0.000131
  }
}
```

### Success Response (with currency conversion)

```json
{
  "success": true,
  "data": {
    "initialAmount": 1000,
    "finalAmount": 1053.4,
    "rewardAmount": 53.4,
    "apy": 5.2,
    "period": "1 year",
    "compoundingPeriods": 403.7,
    "periodicRate": 0.000131,
    "marketValue": {
      "currency": "USD",
      "lptPrice": 12.50,
      "initialMarketValue": 12500,
      "finalMarketValue": 13167.5,
      "rewardMarketValue": 667.5
    }
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Amount must be a positive number"
}
```

## Key Features

### 1. **Livepeer-Specific Compounding**
- Uses actual Livepeer round duration: 21 hours 40 minutes
- Calculates compounding periods based on real protocol schedule
- More accurate than simple daily/weekly compounding

### 2. **Flexible Time Periods**
- Supports standard periods (day, week, month, 6 months, year)
- Automatically calculates the number of Livepeer rounds in each period
- Precise to the protocol's actual operation

### 3. **Real-Time Market Data**
- Fetches current LPT price from Binance (US first, then global)
- Supports multiple currencies (USD, EUR, GBP)
- Uses live exchange rates

### 4. **Compound Interest Formula**
The calculation uses the standard compound interest formula adapted for Livepeer:

```
finalAmount = initialAmount × (1 + periodicRate)^compoundingPeriods
```

Where:
- `periodicRate = (1 + annualRate)^(roundDuration/365) - 1`
- `compoundingPeriods = totalDays / roundDurationInDays`
- `roundDurationInDays = (21 + 40/60) / 24`

## Example Usage

### Basic Calculation

```bash
curl -X POST "https://api.yourproject.com/delegation/calculate-yield" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "apy": "5.2%",
    "period": "1 year"
  }'
```

### With Currency Conversion

```bash
curl -X POST "https://api.yourproject.com/delegation/calculate-yield" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "apy": "5.2%",
    "period": "1 year",
    "includeCurrencyConversion": true,
    "currency": "EUR"
  }'
```

### Weekly Rewards

```bash
curl -X POST "https://api.yourproject.com/delegation/calculate-yield" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "apy": "4.8%",
    "period": "1 week",
    "includeCurrencyConversion": true,
    "currency": "USD"
  }'
```

## Response Field Explanations

| Field | Description |
|-------|-------------|
| `initialAmount` | The input LPT amount |
| `finalAmount` | Total LPT after the specified period |
| `rewardAmount` | LPT rewards earned (`finalAmount - initialAmount`) |
| `apy` | Annual Percentage Yield used in calculation |
| `period` | Time period calculated for |
| `compoundingPeriods` | Number of Livepeer rounds in the period |
| `periodicRate` | Interest rate per round |
| `marketValue.currency` | Target currency for conversion |
| `marketValue.lptPrice` | Current LPT price in USD |
| `marketValue.exchangeRate` | USD to target currency rate (omitted for USD) |
| `marketValue.initialMarketValue` | Initial amount in target currency |
| `marketValue.finalMarketValue` | Final amount in target currency |
| `marketValue.rewardMarketValue` | Rewards in target currency |

## Error Handling

### Common Errors

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Missing required parameters | `amount`, `apy`, `period`, and `orchestratorAddress` are required |
| 400 | Amount must be a positive number | Invalid or negative amount |
| 400 | APY must be a positive number (can be provided as "62%" or 62) | Invalid or negative APY |
| 400 | Invalid period | Period not in allowed list |
| 400 | Invalid currency | Currency not USD, EUR, or GBP |
| 400 | Invalid orchestrator address | Invalid Ethereum address format |
| 500 | Unable to fetch LPT price | Binance API unavailable |
| 500 | Exchange rate API error | Currency conversion service unavailable |
| 500 | Orchestrator data unavailable | Unable to fetch orchestrator information |

### Fallback Behavior

- If currency conversion fails, returns calculation without market values
- Tries Binance US first, then Binance.com for LPT price
- Graceful error handling for external API failures

## Implementation Notes

This endpoint mirrors the exact logic from the React component:

1. **Same Compounding Schedule**: Uses Livepeer's 21h 40m round duration
2. **Same Formula**: Identical compound interest calculation
3. **Same Data Sources**: Binance for LPT price, ExchangeRate-API for currency conversion
4. **Same Validation**: Matching parameter validation and error messages

The API provides a server-side version of the client-side calculator, enabling:
- Backend yield calculations
- Batch processing
- Integration with other services
- Consistent calculations across platforms
