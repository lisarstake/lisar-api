function safeStringify(obj: any) {
  try {
    return JSON.stringify(obj, Object.getOwnPropertyNames(obj), 2);
  } catch {
    try {
      return JSON.stringify(obj);
    } catch {
      return String(obj);
    }
  }
}

export function formatContractError(error: any) {

  
    console.error("Delegation error:", error);
    
    // Log the full error object for debugging
    console.error("Full error object:", JSON.stringify(error, null, 2));

    // Handle specific error cases with user-friendly messages
    const errorString = JSON.stringify(error).toLowerCase();
    const errorMessage = error.message?.toLowerCase() || "";
    const errorName = error.name?.toLowerCase() || "";
    const errorCode = error.code?.toLowerCase() || "";
    const details = error.details || error.data || null;

  let userMessage = 'Transaction failed. Please ensure you have sufficient funds and try again.';

  // Cancelled / user rejected
  if (
    errorCode === 'action_rejected' ||
    errorName.includes('userrejectedrequest') ||
    errorMessage.includes('user rejected') ||
    errorMessage.includes('cancelled') ||
    errorMessage.includes('user denied') ||
    errorString.includes('user rejected')
  ) {
    userMessage = 'Transaction was cancelled.';
  }
  // Insufficient funds
  else if (
    errorCode.includes('insufficient') ||
    errorName.includes('insufficientfunds') ||
    errorName.includes('estimategasexecution') ||
    errorName.includes('invalidinputrpc') ||
    errorName.includes('rpcrequest') ||
    errorMessage.includes('insufficient funds') ||
    errorMessage.includes('exceeds the balance') ||
    errorMessage.includes('gas * gas fee + value') ||
    errorMessage.includes('insufficient funds for transfer') ||
    errorString.includes('insufficient')
  ) {
    userMessage = 'Insufficient funds to complete this transaction. Please add funds to your wallet.';
  }
  // Approval / allowance / authorization issues
  else if (
    errorMessage.includes('allowance') ||
    errorMessage.includes('approve') ||
    errorMessage.includes('authorization') ||
    errorString.includes('allowance')
  ) {
    userMessage = 'Transaction authorization failed. Please try again.';
  }
  // Network / RPC / connection
  else if (
    errorMessage.includes('network') ||
    errorMessage.includes('rpc') ||
    errorMessage.includes('connection') ||
    errorName.includes('network') ||
    errorString.includes('request failed') ||
    errorString.includes('connection refused')
  ) {
    userMessage = 'Connection error. Please check your internet and try again.';
  }

  return {
    userMessage,
    debug: {
      name: error?.name,
      code: error?.code,
      message: error?.message,
      details,
      stack: error?.stack,
      full: safeStringify(error),
    },
  };
}

export function isNonceTooLowError(err: any): boolean {
  const msg = (err?.message || '').toString().toLowerCase();
  const code = (String(err?.code || '')).toLowerCase();
  return (
    msg.includes('nonce too low') ||
    msg.includes('nonce is too low') ||
    msg.includes('nonce too small') ||
    (code.includes('nonce') && msg.includes('low'))
  );
}
