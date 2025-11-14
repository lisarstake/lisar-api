// Query to fetch all active transcoders
export const GET_ALL_TRANSCODERS_QUERY = `
  query GetTranscoders {
    transcoders(first: 1000, where: { active: true }) {
      id
      rewardCut
      feeShare
      totalStake
      active
      status
      lastRewardRound {
        id
      }
      totalVolumeETH
      activationTimestamp
    }
  }
`;

// Query to fetch transcoder by address
export const GET_TRANSCODER_BY_ADDRESS_QUERY = `
  query GetTranscoderByAddress($address: String!) {
    transcoder(id: $address) {
      id
      active
      rewardCut
      feeShare
      totalStake
      status
      activationRound
      deactivationRound
      lastActiveStakeUpdateRound
      activationTimestamp
      lastRewardRound {
        id
      }
      rewardCutUpdateTimestamp
      feeShareUpdateTimestamp
      totalVolumeETH
      thirtyDayVolumeETH
      sixtyDayVolumeETH
      ninetyDayVolumeETH
      totalVolumeUSD
      serviceURI
    }
  }
`;

// Query to fetch delegator by address
export const GET_DELEGATOR_BY_ADDRESS_QUERY = `
  query GetDelegatorByAddress($address: String!) {
    delegator(id: $address) {
      id
      delegate {
        id
        active
        rewardCut
        feeShare
        totalStake
        status
      }
      startRound
      lastClaimRound {
        id
      }
      bondedAmount
      principal
      unbonded
      fees
      withdrawnFees
      delegatedAmount
      unbondingLocks {
        id
        amount
        withdrawRound
        delegate {
          id
        }
      }
    }
  }
`;

// Query to fetch delegation info between delegator and transcoder
export const GET_DELEGATION_BY_ADDRESS_QUERY = `
  query GetDelegationByAddress($delegator: String!, $transcoder: String!) {
    delegator(id: $delegator) {
      id
      delegate {
        id
        active
        rewardCut
        feeShare
        totalStake
        status
      }
      bondedAmount
      fees
      delegatedAmount
    }
    transcoder(id: $transcoder) {
      id
      active
      rewardCut
      feeShare
      totalStake
      status
    }
  }
`;

// Query to fetch all delegations for a delegator
export const GET_ALL_DELEGATIONS_QUERY = `
  query GetAllDelegations($delegator: String!) {
    delegator(id: $delegator) {
      id
      delegate {
        id
        active
        rewardCut
        feeShare
        totalStake
        status
      }
      bondedAmount
      fees
      delegatedAmount
      unbondingLocks {
        id
        amount
        withdrawRound
        delegate {
          id
        }
      }
    }
  }
`;

// Query to fetch bond events (delegations) from a delegator to orchestrators
export const GET_BOND_EVENTS_QUERY = `
  query GetBondEvents($delegator: String!) {
    bondEvents(where: { delegator: $delegator }, orderBy: timestamp, orderDirection: desc) {
      id
      bondedAmount
      additionalAmount
      newDelegate {
        id
        active
        rewardCut
        feeShare
        totalStake
        status
      }
      oldDelegate {
        id
        active
        rewardCut
        feeShare
        totalStake
        status
      }
      delegator {
        id
        bondedAmount
        fees
      }
      timestamp
      round {
        id
      }
    }
  }
`;

// Query to fetch pending rewards for a delegator
export const GET_PENDING_REWARDS_QUERY = `
  query GetPendingRewards($delegator: String!, $transcoder: String!) {
    delegator(id: $delegator) {
      id
      fees
      bondedAmount
    }
    transcoder(id: $transcoder) {
      id
      active
      rewardCut
      feeShare
      totalStake
    }
  }
`;

// Query to fetch all active transcoders
export const GET_ACTIVE_TRANSCODERS_QUERY = `
  query GetActiveTranscoders($first: Int = 20) {
    transcoders(
      where: { active: true }
      first: $first
      orderBy: totalStake
      orderDirection: desc
    ) {
      id
      active
      rewardCut
      feeShare
      totalStake
      status
      activationRound
      deactivationRound
      lastActiveStakeUpdateRound
      activationTimestamp
      lastRewardRound {
        id
      }
      rewardCutUpdateTimestamp
      feeShareUpdateTimestamp
      totalVolumeETH
      thirtyDayVolumeETH
      sixtyDayVolumeETH
      ninetyDayVolumeETH
      totalVolumeUSD
      serviceURI
    }
  }
`;

// Query to fetch ENS domains based on the resolved address
export const GET_ENS_QUERY = `
  query getENS($address: String!) {
    domains(where: { resolvedAddress: $address }, orderBy: createdAt, orderDirection: desc) {
      name
      resolvedAddress {
        id
      }
    }
  }
`;


export const GET_PROFILE_INFO = `
  query GetProfileInfo($id: String!) {
    delegator(id: $id) {
      bondedAmount
      id
      principal
      unbonded
      withdrawnFees
      fees
      startRound
      unbondingLocks {
        id
        amount
        unbondingLockId
        withdrawRound
        delegate {
          id
        }
      }
      delegate {
        id
        active
        activationTimestamp
        totalStake
        serviceURI
        transcoderDays(first: 1, orderBy: date, orderDirection: asc) {
          id
          volumeUSD
          date
          transcoder {
            feeShare
            rewardCut
            rewardCutUpdateTimestamp
            feeShareUpdateTimestamp
            lastActiveStakeUpdateRound
            active
            totalStake
            totalVolumeUSD
            thirtyDayVolumeETH
            sixtyDayVolumeETH
            id
            activationTimestamp
            delegator {
              bondedAmount
              delegatedAmount
              fees
              principal
              withdrawnFees
            }
          }
        }
      }
    }
  }
`;


export const GET_ROUNDS_INFO = `
  query GetRoundsInfo {
    newRoundEvents(first: 1000, orderBy: timestamp, orderDirection: asc) {
      round {
        id
        delegatorsCount
        length
        newStake
        movedStake
        numActiveTranscoders
        participationRate
        totalActiveStake
        totalSupply
      }
      timestamp
    }
  }
`;

export const GET_PROTOCOL_STATS = `
query GetProtocolStats {
  protocols {
    activeTranscoderCount
    delegatorsCount
    lptPriceEth
    inflation
    inflationChange
    participationRate
    targetBondingRate
    roundLength
    roundCount
    totalSupply
    totalActiveStake
    totalVolumeUSD
    unbondingPeriod
    winningTicketCount
    totalVolumeETH
  }
}
`;

export const GET_EVENTS = `
  query GetEvents($id: String!) {
    transactions(where: { from_contains: $id }) {
      events(orderBy: timestamp, orderDirection: desc, first: 1000) {
        __typename
        round {
          id
        }
        transaction {
          id
          timestamp
          from
        }
        ... on BondEvent {
          delegator {
            id
          }
          newDelegate {
            id
          }
          oldDelegate {
            id
          }
          additionalAmount
        }
        ... on UnbondEvent {
          delegate {
            id
          }
          delegator {
            id
          }
          amount
        }
        ... on RebondEvent {
          delegate {
            id
          }
          delegator {
            id
          }
          amount
        }
        ... on RewardEvent {
          delegate {
            id
          }
          rewardTokens
        }
      }
    }
  }
`;

// Earner leaderboard queries
export const GET_EARNER_LEADERBOARD_QUERY = `
  query GetEarnerLeaderboard($first: Int!, $skip: Int!, $orderBy: String!, $orderDirection: String!) {
    delegators(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: { bondedAmount_gt: "0" }
    ) {
      id
      bondedAmount
      fees
      delegatedAmount
      lastClaimRound {
        id
      }
      delegate {
        id
        feeShare
        rewardCut
      }
    }
  }
`;

export const GET_TOP_EARNERS_BY_REWARDS_QUERY = `
  query GetTopEarnersByRewards($first: Int!) {
    rewardEvents(
      first: $first
      orderBy: rewardTokens
      orderDirection: desc
      where: { rewardTokens_gt: "0" }
    ) {
      delegator {
        id
        bondedAmount
        fees
        delegatedAmount
      }
      rewardTokens
      round {
        id
      }
      delegate {
        id
      }
    }
  }
`;

// Query for time-filtered delegator events
export const GET_DELEGATOR_EVENTS_BY_TIME_PERIOD_QUERY = `
  query GetDelegatorEventsByTimePeriod($delegator: String!, $startTimestamp: Int!, $endTimestamp: Int!) {
    transactions(
      where: { 
        from_contains: $delegator,
        timestamp_gte: $startTimestamp,
        timestamp_lte: $endTimestamp
      }
      orderBy: timestamp
      orderDirection: desc
      first: 1000
    ) {
      events(orderBy: timestamp, orderDirection: desc) {
        __typename
        round {
          id
        }
        transaction {
          id
          timestamp
          from
        }
        ... on RewardEvent {
          delegate {
            id
          }
          rewardTokens
        }
        ... on BondEvent {
          delegator {
            id
          }
          newDelegate {
            id
          }
          oldDelegate {
            id
          }
          additionalAmount
        }
      }
    }
  }
`;

// Query to get reward events for a specific delegator within a time period
export const GET_DELEGATOR_REWARD_EVENTS_QUERY = `
  query GetDelegatorRewardEvents($delegatorId: ID!, $startTimestamp: Int!, $endTimestamp: Int!) {
    delegator(id: $delegatorId) {
      id
      bondedAmount
    }
    rewardEvents(
      where: {
        delegator: $delegatorId,
        timestamp_gte: $startTimestamp,
        timestamp_lte: $endTimestamp
      }
      orderBy: timestamp
      orderDirection: desc
      first: 1000
    ) {
      id
      rewardTokens
      timestamp
      round {
        id
      }
      delegate {
        id
      }
      delegator {
        id
      }
    }
  }
`;

// Simple query to get basic delegator info (for fallback)
export const GET_EARNINGS_BY_TIME_PERIOD_QUERY = `
  query GetEarningsByTimePeriod($delegators: [String!]!) {
    delegators(where: { id_in: $delegators }) {
      id
      bondedAmount
      delegatedAmount
      delegate {
        id
        feeShare
        rewardCut
      }
    }
  }
`;

// Query for bond events within time period
export const GET_BOND_EVENTS_BY_TIME_PERIOD_QUERY = `
  query GetBondEventsByTimePeriod($startTimestamp: Int!, $endTimestamp: Int!, $first: Int!) {
    bondEvents(
      where: { 
        timestamp_gte: $startTimestamp,
        timestamp_lte: $endTimestamp
      }
      orderBy: timestamp
      orderDirection: desc
      first: $first
    ) {
      id
      delegator {
        id
      }
      bondedAmount
      additionalAmount
      newDelegate {
        id
      }
      timestamp
      round {
        id
      }
    }
  }
`;