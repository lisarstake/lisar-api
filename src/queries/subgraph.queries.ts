// Query to fetch all transcoders
export const GET_ALL_TRANSCODERS_QUERY = `
  query GetTranscoders {
    transcoders(first: 1000) {
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
