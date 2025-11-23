import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SUI_NETWORK, CONTRACT_ADDRESSES } from './constants';

// Initialize Sui client
export const suiClient = new SuiClient({
	url: getFullnodeUrl(SUI_NETWORK as 'testnet' | 'mainnet' | 'devnet'),
});

// Helper to format Sui address
export function formatAddress(address: string, length: number = 6): string {
	if (!address) return '';
	if (address.length <= length * 2) return address;
	return `${address.slice(0, length)}...${address.slice(-length)}`;
}

// Helper to format SUI amount
export function formatSui(amount: string | number): string {
	const sui = typeof amount === 'string' ? parseFloat(amount) : amount;
	return (sui / 1_000_000_000).toFixed(4);
}

// Build verification transaction
export async function buildVerificationTransaction(
	jobId: string,
	modelId: string,
	result: any,
	inputHash: string,
	timestampMs: number,
	modelVersion: string,
	inferenceTimeMs: number,
	signature: string
): Promise<TransactionBlock> {
	const tx = new TransactionBlock();

	// Convert strings to vector<u8>
	const jobIdBytes = Array.from(new TextEncoder().encode(jobId));
	const modelIdBytes = Array.from(new TextEncoder().encode(modelId));
	const resultBytes = Array.from(new TextEncoder().encode(JSON.stringify(result)));
	const inputHashBytes = hexToBytes(inputHash);
	const modelVersionBytes = Array.from(new TextEncoder().encode(modelVersion));
	const signatureBytes = hexToBytes(signature);

	tx.moveCall({
		target: `${CONTRACT_ADDRESSES.APP_PACKAGE_ID}::trust_certificate::verify_and_issue_certificate`,
		arguments: [
			tx.object(CONTRACT_ADDRESSES.ENCLAVE_CONFIG_ID), // enclave
			tx.object(CONTRACT_ADDRESSES.ENCLAVE_CONFIG_ID), // config
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

	return tx;
}

// Helper to convert hex string to bytes
function hexToBytes(hex: string): number[] {
	const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
	const bytes: number[] = [];
	for (let i = 0; i < cleanHex.length; i += 2) {
		bytes.push(parseInt(cleanHex.substr(i, 2), 16));
	}
	return bytes;
}

// Helper to get transaction status
export async function getTransactionStatus(digest: string) {
	try {
		const txResponse = await suiClient.getTransactionBlock({
			digest,
			options: {
				showEffects: true,
				showEvents: true,
			},
		});
		return txResponse;
	} catch (error) {
		console.error('Error fetching transaction:', error);
		throw error;
	}
}

// Helper to parse certificate from transaction events
export function parseCertificateFromEvents(events: any[]): any {
	const certificateEvent = events.find((e) => e.type.includes('CertificateIssued'));

	if (certificateEvent) {
		return certificateEvent.parsedJson;
	}

	return null;
}
