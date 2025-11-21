import { useState, useCallback } from 'react';
import { verifyJob, getVerificationStatus } from '@/lib/api';
import { buildVerificationTransaction } from '@/lib/sui';
import { useSignAndExecuteTransactionBlock } from '@mysten/dapp-kit';
import toast from 'react-hot-toast';

export function useVerification() {
	const { mutate: signAndExecuteTransactionBlock } = useSignAndExecuteTransactionBlock();
	const [verifying, setVerifying] = useState(false);
	const [verificationResult, setVerificationResult] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);

	const verifyOnChain = useCallback(
		async (
			jobId: string,
			modelId: string,
			result: any,
			inputHash: string,
			timestampMs: number,
			modelVersion: string,
			inferenceTimeMs: number,
			signature: string
		) => {
			setVerifying(true);
			setError(null);

			try {
				// Build transaction
				const tx = await buildVerificationTransaction(
					jobId,
					modelId,
					result,
					inputHash,
					timestampMs,
					modelVersion,
					inferenceTimeMs,
					signature
				);

				// Sign and execute
				signAndExecuteTransactionBlock(
					{
						transactionBlock: tx,
						options: {
							showEffects: true,
							showEvents: true,
						},
					},
					{
						onSuccess: (txResult) => {
							console.log('Verification transaction result:', txResult);

							setVerificationResult({
								digest: txResult.digest,
								status: txResult.effects?.status,
							});

							toast.success('Verification successful!');
							setVerifying(false);
						},
						onError: (err: any) => {
							const errorMsg = err.message || 'Verification failed';
							setError(errorMsg);
							toast.error(errorMsg);
							console.error('Verification error:', err);
							setVerifying(false);
						},
					}
				);
			} catch (err: any) {
				const errorMsg = err.message || 'Verification failed';
				setError(errorMsg);
				toast.error(errorMsg);
				console.error('Verification error:', err);
				setVerifying(false);
				throw err;
			}
		},
		[signAndExecuteTransactionBlock]
	);

	const checkVerificationStatus = useCallback(async (jobId: string) => {
		try {
			const status = await getVerificationStatus(jobId);
			return status;
		} catch (err) {
			console.error('Failed to check verification status:', err);
			return null;
		}
	}, []);

	return {
		verifyOnChain,
		checkVerificationStatus,
		verifying,
		verificationResult,
		error,
	};
}
