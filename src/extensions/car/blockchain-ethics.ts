import { CategoricalImperativeResult } from './layers';

/**
 * Interface for blockchain actions to be evaluated
 */
interface BlockchainAction {
  action: string;
  params: any;
  justification?: string;
}

/**
 * Interface for address safety check results
 */
interface BlockchainAddress {
  address: string;
  category: 'safe' | 'suspicious' | 'malicious' | 'unknown';
  reason?: string;
}

/**
 * Interface for contract safety check results
 */
interface ContractSafetyResult {
  safe: boolean;
  reason: string;
  risks?: string[];
}

// Mock list of known malicious addresses (in production, this could be updated dynamically)
const knownMaliciousAddresses: string[] = [
  "0xknownScamAddress",
  "0xanotherScam",
];

/**
 * Check if an address is safe, suspicious, or malicious
 * @param address The blockchain address to evaluate
 * @returns An object indicating the address's safety category and reason
 */
function checkAddress(address: string): BlockchainAddress {
  if (knownMaliciousAddresses.includes(address)) {
    return {
      address,
      category: 'malicious',
      reason: 'Address is known to be associated with scams or malicious activities.',
    };
  }

  // Simple heuristic: addresses starting with '0x000' are considered suspicious
  if (address.startsWith('0x000')) {
    return {
      address,
      category: 'suspicious',
      reason: 'Address matches suspicious pattern (starts with 0x000).',
    };
  }

  return {
    address,
    category: 'unknown',
    reason: 'No information available for this address.',
  };
}

/**
 * Check the safety of a contract interaction
 * @param contractAddress The address of the contract
 * @param data The call data for the contract interaction
 * @returns An object indicating if the contract interaction is safe and any risks
 */
function checkContractSafety(contractAddress: string, data: string): ContractSafetyResult {
  // Mock: Contracts starting with '0xsafe' are considered safe
  if (contractAddress.startsWith('0xsafe')) {
    return {
      safe: true,
      reason: 'Contract is verified and safe.',
    };
  }

  // Check for dangerous operations in the data
  if (data.includes('selfdestruct')) {
    return {
      safe: false,
      reason: 'Contract interaction includes dangerous operations (selfdestruct).',
      risks: ['Potential loss of funds'],
    };
  }

  return {
    safe: false,
    reason: 'Contract safety could not be verified.',
    risks: ['Unknown contract behavior'],
  };
}

/**
 * Check if the transaction value is within ethical limits
 * @param value The value of the transaction
 * @param token The token being transacted (optional)
 * @returns A CategoricalImperativeResult indicating approval or rejection
 */
function checkTransactionValue(value: number, token?: string): CategoricalImperativeResult {
  const MAX_TRANSACTION_VALUE = 1000; // Example limit in token units or ETH
  if (value > MAX_TRANSACTION_VALUE) {
    return {
      approved: false,
      reason: `Transaction value exceeds maximum allowed limit of ${MAX_TRANSACTION_VALUE} ${token || 'ETH'}`,
    };
  }
  return { approved: true, reason: 'Transaction value within acceptable limits' };
}

/**
 * Check if the action is blockchain-related
 * @param action The action to evaluate
 * @returns True if the action is blockchain-related, false otherwise
 */
function isBlockchainAction(action: BlockchainAction): boolean {
  const blockchainActions = [
    'executeTransaction',
    'deployContract',
    'callContract',
    'signMessage',
    'approveToken',
    'transferToken',
  ];
  return blockchainActions.includes(action.action);
}

/**
 * Validate that the blockchain action has all required parameters
 * @param action The action to validate
 * @returns An object indicating if the parameters are valid and the reason if not
 */
function validateActionParams(action: BlockchainAction): { valid: boolean; reason: string } {
  switch (action.action) {
    case 'executeTransaction':
      if (!action.params.to) {
        return { valid: false, reason: 'Missing recipient address' };
      }
      break;

    case 'deployContract':
      if (!action.params.bytecode) {
        return { valid: false, reason: 'Missing contract bytecode' };
      }
      break;

    case 'callContract':
      if (!action.params.to || !action.params.data) {
        return { valid: false, reason: 'Missing contract address or call data' };
      }
      break;

    case 'signMessage':
      if (!action.params.message) {
        return { valid: false, reason: 'Missing message to sign' };
      }
      break;

    case 'approveToken':
      if (!action.params.token || !action.params.spender || !action.params.amount) {
        return { valid: false, reason: 'Missing token approval parameters (token, spender, or amount)' };
      }
      break;

    case 'transferToken':
      if (!action.params.token || !action.params.to || !action.params.amount) {
        return { valid: false, reason: 'Missing token transfer parameters (token, recipient, or amount)' };
      }
      break;

    default:
      return { valid: false, reason: 'Unknown blockchain action' };
  }
  return { valid: true, reason: 'All required parameters are present' };
}

/**
 * Evaluate blockchain actions against enhanced ethical constraints
 * @param action The blockchain action to evaluate
 * @returns A CategoricalImperativeResult indicating approval or rejection with reasoning
 */
export function evaluateBlockchainAction(action: BlockchainAction): CategoricalImperativeResult {
  // Skip evaluation for non-blockchain actions
  if (!isBlockchainAction(action)) {
    return { approved: true, reason: 'Not a blockchain action' };
  }

  // Validate action parameters
  const validParams = validateActionParams(action);
  if (!validParams.valid) {
    return { approved: false, reason: validParams.reason };
  }

  // Check recipient address if present
  if (action.params.to) {
    const addressCheck = checkAddress(action.params.to);
    if (addressCheck.category === 'malicious') {
      return {
        approved: false,
        reason: `Malicious recipient address: ${addressCheck.reason}`,
      };
    }
    if (addressCheck.category === 'suspicious') {
      return {
        approved: false,
        reason: `Suspicious recipient address: ${addressCheck.reason}`,
      };
    }
  }

  // Check contract safety for interactions with data
  if (action.params.data && action.params.data.length > 2) {
    const contractCheck = checkContractSafety(action.params.to, action.params.data);
    if (!contractCheck.safe) {
      return {
        approved: false,
        reason: `Unsafe contract interaction: ${contractCheck.reason}`,
      };
    }
  }

  // Check transaction value if present
  if (action.params.value) {
    const valueCheck = checkTransactionValue(action.params.value, action.params.token);
    if (!valueCheck.approved) {
      return valueCheck;
    }
  }

  // If all checks pass, approve the action
  return { approved: true, reason: 'Blockchain action passed all ethical checks' };
}
