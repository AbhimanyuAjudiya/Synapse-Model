import { TransactionBlock } from '@mysten/sui.js/transactions';
import { suiClient, CONTRACT_ADDRESSES } from '../config/sui';
import { createLogger } from '../utils/logger';
import { BlockchainError } from '../utils/errors';
import { hexToBytes, stringToBytes } from '../utils/helpers';

const logger = createLogger('suiService');

export class SuiService {
  /**
   * Build verification transaction
   */
  async buildVerificationTransaction(
    jobId: string,
    modelId: string,
    result: any,
    inputHash: string,
    timestampMs: number,
    modelVersion: string,
    inferenceTimeMs: number,
    signature: string
  ): Promise<TransactionBlock> {
    try {
      const tx = new TransactionBlock();

      // Convert parameters to correct format
      const jobIdBytes = stringToBytes(jobId);
      const modelIdBytes = stringToBytes(modelId);
      const resultBytes = stringToBytes(JSON.stringify(result));
      const inputHashBytes = hexToBytes(inputHash);
      const modelVersionBytes = stringToBytes(modelVersion);
      const signatureBytes = hexToBytes(signature);

      // Call verify_and_issue_certificate
      tx.moveCall({
        target: `${CONTRACT_ADDRESSES.PACKAGE_ID}::trust_certificate::verify_and_issue_certificate`,
        typeArguments: [`${CONTRACT_ADDRESSES.PACKAGE_ID}::synapsemodel_app::SYNAPSEMODEL_APP`],
        arguments: [
          tx.object(CONTRACT_ADDRESSES.ENCLAVE_ID),
          tx.object(CONTRACT_ADDRESSES.ENCLAVE_CONFIG_ID),
          tx.object('0x6'), // Clock object
          tx.pure(jobIdBytes),
          tx.pure(modelIdBytes),
          tx.pure(resultBytes),
          tx.pure(inputHashBytes),
          tx.pure(timestampMs, 'u64'),
          tx.pure(modelVersionBytes),
          tx.pure(inferenceTimeMs, 'u64'),
          tx.pure(signatureBytes),
        ],
      });

      logger.info({ jobId }, 'Verification transaction built');
      return tx;
    } catch (error) {
      logger.error({ error, jobId }, 'Failed to build verification transaction');
      throw new BlockchainError('Failed to build verification transaction');
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(digest: string) {
    try {
      const tx = await suiClient.getTransactionBlock({
        digest,
        options: {
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
        },
      });

      return tx;
    } catch (error) {
      logger.error({ error, digest }, 'Failed to get transaction status');
      throw new BlockchainError('Failed to get transaction status');
    }
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(digest: string, timeoutMs: number = 30000): Promise<any> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        const tx = await this.getTransactionStatus(digest);

        if (tx.effects?.status?.status === 'success') {
          logger.info({ digest }, 'Transaction confirmed successfully');
          return tx;
        }

        if (tx.effects?.status?.status === 'failure') {
          logger.error({ digest, status: tx.effects.status }, 'Transaction failed');
          throw new BlockchainError('Transaction failed on-chain');
        }
      } catch (error) {
        // Continue waiting
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    throw new BlockchainError('Transaction confirmation timeout');
  }

  /**
   * Parse certificate from events
   */
  parseCertificateFromEvents(events: any[]): any {
    try {
      const certificateEvent = events.find((e) =>
        e.type.includes('CertificateIssued')
      );

      if (certificateEvent) {
        return certificateEvent.parsedJson;
      }

      return null;
    } catch (error) {
      logger.error({ error }, 'Failed to parse certificate from events');
      return null;
    }
  }

  /**
   * Get enclave details
   */
  async getEnclaveDetails(enclaveId: string) {
    try {
      const object = await suiClient.getObject({
        id: enclaveId,
        options: {
          showContent: true,
        },
      });

      return object;
    } catch (error) {
      logger.error({ error, enclaveId }, 'Failed to get enclave details');
      throw new BlockchainError('Failed to get enclave details');
    }
  }

  /**
   * Get job registry stats
   */
  async getJobRegistryStats() {
    try {
      if (!CONTRACT_ADDRESSES.JOB_REGISTRY_ID) {
        logger.warn('Job registry ID not configured');
        return null;
      }

      const object = await suiClient.getObject({
        id: CONTRACT_ADDRESSES.JOB_REGISTRY_ID,
        options: {
          showContent: true,
        },
      });

      return object;
    } catch (error) {
      logger.error({ error }, 'Failed to get job registry stats');
      return null;
    }
  }
}

export default new SuiService();
