# Enhanced LPT Yield Calculator with Orchestrator Support

## Overview

The API now provides **two yield calculation endpoints** to address different use cases:

1. **Generic Yield Calculator** - Uses a provided APY for basic calculations
2. **Orchestrator-Specific Calculator** - Fetches real orchestrator data for precise calculations

## Key Difference: Orchestrator Consideration

### ❌ **Generic Calculator (`/calculate-yield`)**
- **Input**: Manual APY entry
- **Limitations**: Doesn't consider orchestrator-specific parameters
- **Use Case**: General yield estimates or theoretical calculations

### ✅ **Enhanced Calculator (`/calculate-yield-with-orchestrator`)**
- **Input**: Orchestrator address (APY calculated automatically)
- **Considerations**: 
  - **Reward Cut** - Orchestrator's commission on rewards
  - **Fee Share** - Percentage of fees shared with delegators
  - **Performance History** - Recent reward generation
  - **Activity Status** - Last active round

## Why Orchestrator Choice Matters

In Livepeer delegation, **different orchestrators significantly impact returns** due to:

### 1. **Reward Cut Variations**
```
Orchestrator A: 10% reward cut → Delegator gets 90% of rewards
Orchestrator B: 25% reward cut → Delegator gets 75% of rewards
```

### 2. **Fee Share Differences**
```
Orchestrator A: 50% fee share → Delegator gets 50% of transcoding fees
Orchestrator B: 80% fee share → Delegator gets 80% of transcoding fees
```

### 3. **Performance Variability**
- **Active orchestrators** generate more rewards
- **Inactive orchestrators** may earn little to no rewards
- **Popular orchestrators** get more transcoding work

## API Endpoints Comparison

### Generic Calculation
```bash
POST /delegation/calculate-yield
{
  "amount": 1000,
  "apy": 5.2,
  "period": "1 year"
}
```

**Response**: Basic compound interest calculation
```json
{
  "initialAmount": 1000,
  "finalAmount": 1053.4,
  "rewardAmount": 53.4,
  "apy": 5.2
}
```

### Orchestrator-Specific Calculation
```bash
POST /delegation/calculate-yield-with-orchestrator
{
  "amount": 1000,
  "period": "1 year",
  "orchestratorAddress": "0x742d35Cc6634C0532925a3b8C6Cd1d31F03e46F6"
}
```

**Response**: Real-world calculation with orchestrator data
```json
{
  "initialAmount": 1000,
  "finalAmount": 1042.8,
  "rewardAmount": 42.8,
  "grossApy": 5.2,
  "netApy": 4.16,
  "orchestrator": {
    "address": "0x742d35Cc6634C0532925a3b8C6Cd1d31F03e46F6",
    "rewardCut": 20,
    "feeShare": 50,
    "delegatorRewardShare": 0.8,
    "lastActiveRound": "2890"
  }
}
```

## Enhanced Features

### 1. **Real Orchestrator Data**
- Fetches live reward cut and fee share from Livepeer subgraph
- Considers orchestrator's recent activity
- Uses actual performance metrics

### 2. **Gross vs Net APY**
- **Gross APY**: Total yield before orchestrator's cut
- **Net APY**: Actual yield delegator receives after cuts
- **Realistic Returns**: Accounts for real-world commission structure

### 3. **Orchestrator Performance Analysis**
- Recent reward generation history
- Activity status (last active round)
- Performance-based APY estimation

### 4. **Comprehensive Validation**
- Orchestrator address format validation
- Orchestrator existence verification
- Real-time data availability checks

## Use Case Examples

### 1. **Orchestrator Comparison Tool**
```javascript
// Compare multiple orchestrators
const orchestrators = [
  "0x742d35Cc6634C0532925a3b8C6Cd1d31F03e46F6",
  "0x123d35Cc6634C0532925a3b8C6Cd1d31F03e46F7",
  "0x456d35Cc6634C0532925a3b8C6Cd1d31F03e46F8"
];

for (const orchestrator of orchestrators) {
  const result = await calculateYieldWithOrchestrator({
    amount: 1000,
    period: "1 year",
    orchestratorAddress: orchestrator
  });
  console.log(`${orchestrator}: ${result.data.netApy}% net APY`);
}
```

### 2. **Investment Decision Support**
```javascript
// Get realistic yield projection for specific orchestrator
const investment = await calculateYieldWithOrchestrator({
  amount: 5000,
  period: "1 year",
  orchestratorAddress: "0x742d35Cc6634C0532925a3b8C6Cd1d31F03e46F6",
  includeCurrencyConversion: true,
  currency: "USD"
});

console.log(`Expected rewards: $${investment.data.marketValue.rewardMarketValue}`);
console.log(`Orchestrator takes: ${investment.data.orchestrator.rewardCut}% cut`);
```

### 3. **Portfolio Analysis**
```javascript
// Analyze existing delegations
const delegations = await getUserDelegations(userAddress);

for (const delegation of delegations) {
  const projection = await calculateYieldWithOrchestrator({
    amount: delegation.amount,
    period: "1 month",
    orchestratorAddress: delegation.orchestratorAddress
  });
  
  console.log(`Monthly yield from ${delegation.orchestratorAddress}: ${projection.data.rewardAmount} LPT`);
}
```

## Error Handling

### Orchestrator-Specific Errors
- **"Orchestrator not found"** - Invalid or non-existent address
- **"Failed to fetch orchestrator data"** - Subgraph connectivity issues
- **"Invalid orchestrator address format"** - Malformed Ethereum address

### Enhanced Validation
- Real-time orchestrator existence verification
- Active status checking
- Data availability validation

## Migration Guide

### From Generic to Orchestrator-Specific

**Before** (Generic):
```json
{
  "amount": 1000,
  "apy": 5.0,
  "period": "1 year"
}
```

**After** (Orchestrator-Specific):
```json
{
  "amount": 1000,
  "period": "1 year",
  "orchestratorAddress": "0x742d35Cc6634C0532925a3b8C6Cd1d31F03e46F6"
}
```

### Benefits of Migration
1. **Accurate Projections** - Real orchestrator parameters
2. **Better Decision Making** - Compare actual orchestrators
3. **Risk Assessment** - Understand orchestrator-specific risks
4. **Performance Tracking** - Monitor actual vs projected returns

## Conclusion

The **orchestrator-specific yield calculator** provides significantly more accurate and useful projections by considering:

- ✅ **Real reward cuts** from live orchestrator data
- ✅ **Actual fee sharing** arrangements  
- ✅ **Performance history** and activity status
- ✅ **Network-specific** compounding schedules
- ✅ **Live market data** for currency conversion

This makes it the **recommended endpoint** for production applications where users need accurate yield projections for actual Livepeer delegation decisions.
