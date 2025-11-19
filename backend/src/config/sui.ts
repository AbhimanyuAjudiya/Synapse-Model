import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { createLogger } from '../utils/logger';

const logger = createLogger('sui');

const SUI_NETWORK = (process.env.SUI_NETWORK || 'testnet') as 'testnet' | 'mainnet' | 'devnet';
const SUI_RPC_URL = process.env.SUI_RPC_URL || getFullnodeUrl(SUI_NETWORK);

// Contract addresses
export const CONTRACT_ADDRESSES = {
  PACKAGE_ID: process.env.SUI_PACKAGE_ID || '',
  ENCLAVE_CONFIG_ID: process.env.SUI_ENCLAVE_CONFIG_ID || '',
  JOB_REGISTRY_ID: process.env.SUI_JOB_REGISTRY_ID || '',
  ENCLAVE_ID: process.env.SUI_ENCLAVE_ID || '',
};

// Initialize Sui client
export const suiClient = new SuiClient({
  url: SUI_RPC_URL,
});

logger.info({
  network: SUI_NETWORK,
  rpcUrl: SUI_RPC_URL,
  packageId: CONTRACT_ADDRESSES.PACKAGE_ID,
}, 'Sui client initialized');

/**
 * Validate contract addresses are configured
 */
export function validateContractConfig(): void {
  const missing: string[] = [];

  if (!CONTRACT_ADDRESSES.PACKAGE_ID) missing.push('SUI_PACKAGE_ID');
  if (!CONTRACT_ADDRESSES.ENCLAVE_CONFIG_ID) missing.push('SUI_ENCLAVE_CONFIG_ID');
  if (!CONTRACT_ADDRESSES.ENCLAVE_ID) missing.push('SUI_ENCLAVE_ID');

  if (missing.length > 0) {
    logger.warn(
      { missing },
      'Some contract addresses are not configured. Verification features may not work.'
    );
  }
}

// Validate on module load
validateContractConfig();

export { SUI_NETWORK };
