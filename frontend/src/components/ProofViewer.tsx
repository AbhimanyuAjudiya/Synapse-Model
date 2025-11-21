import { useState } from 'react';
import { Job } from '@/types';
import { formatAddress } from '@/lib/sui';
import toast from 'react-hot-toast';

interface ProofViewerProps {
	job: Job;
}

export default function ProofViewer({ job }: ProofViewerProps) {
	const [showFullSignature, setShowFullSignature] = useState(false);
	const [showFullPublicKey, setShowFullPublicKey] = useState(false);

	if (!job.teeSignature || !job.enclavePublicKey) {
		return (
			<div className="bg-gray-50 rounded-lg p-6 text-center">
				<p className="text-gray-600">No proof available yet</p>
			</div>
		);
	}

	const copyToClipboard = (text: string, label: string) => {
		navigator.clipboard.writeText(text);
		toast.success(`${label} copied to clipboard`);
	};

	return (
		<div className="bg-white rounded-lg shadow-md p-6">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">TEE Proof Details</h3>

			<div className="space-y-4">
				{/* Input Hash */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Input Hash</label>
					<div className="flex items-center space-x-2">
						<code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono text-gray-800 overflow-x-auto">
							{job.inputHash}
						</code>
						<button
							onClick={() => copyToClipboard(job.inputHash, 'Input hash')}
							className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
							title="Copy"
						>
							📋
						</button>
					</div>
				</div>

				{/* Signature */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">TEE Signature</label>
					<div className="flex items-center space-x-2">
						<code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono text-gray-800 overflow-x-auto">
							{showFullSignature ? job.teeSignature : `${job.teeSignature?.slice(0, 40)}...`}
						</code>
						<button
							onClick={() => setShowFullSignature(!showFullSignature)}
							className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm whitespace-nowrap"
						>
							{showFullSignature ? 'Hide' : 'Show'}
						</button>
						<button
							onClick={() => copyToClipboard(job.teeSignature!, 'Signature')}
							className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
							title="Copy"
						>
							📋
						</button>
					</div>
				</div>

				{/* Enclave Public Key */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Enclave Public Key</label>
					<div className="flex items-center space-x-2">
						<code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono text-gray-800 overflow-x-auto">
							{showFullPublicKey
								? job.enclavePublicKey
								: `${job.enclavePublicKey?.slice(0, 40)}...`}
						</code>
						<button
							onClick={() => setShowFullPublicKey(!showFullPublicKey)}
							className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm whitespace-nowrap"
						>
							{showFullPublicKey ? 'Hide' : 'Show'}
						</button>
						<button
							onClick={() => copyToClipboard(job.enclavePublicKey!, 'Public key')}
							className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
							title="Copy"
						>
							📋
						</button>
					</div>
				</div>

				{/* Timestamp */}
				{job.timestamp && (
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Timestamp</label>
						<div className="bg-gray-100 px-3 py-2 rounded text-sm text-gray-800">
							{new Date(job.timestamp).toLocaleString()} ({job.timestamp})
						</div>
					</div>
				)}

				{/* Verification Status */}
				{job.verificationTxHash ? (
					<div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
						<div className="flex items-center space-x-2 mb-2">
							<svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clipRule="evenodd"
								/>
							</svg>
							<span className="font-medium text-green-800">Verified On-Chain</span>
						</div>
						<div className="text-sm text-green-700">
							Transaction:{' '}
							<a
								href={`https://suiexplorer.com/txblock/${job.verificationTxHash}?network=testnet`}
								target="_blank"
								rel="noopener noreferrer"
								className="underline hover:text-green-900"
							>
								{formatAddress(job.verificationTxHash, 8)}
							</a>
						</div>
					</div>
				) : (
					<div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
						<p className="text-sm text-yellow-800">
							⚠️ Not yet verified on-chain. Click "Verify on Sui" to create a trust certificate.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
