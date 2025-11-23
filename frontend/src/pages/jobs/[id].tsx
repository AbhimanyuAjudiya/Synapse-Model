import { useRouter } from 'next/router';
import { useState } from 'react';
import Layout from '@/components/Layout';
import JobStatus from '@/components/JobStatus';
import ProofViewer from '@/components/ProofViewer';
import TrustCertificate from '@/components/TrustCertificate';
import { useJob } from '@/hooks/useJob';
import { useVerification } from '@/hooks/useVerification';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { JobStatus as Status } from '@/types';
import toast from 'react-hot-toast';

export default function JobDetailPage() {
	const router = useRouter();
	const { id } = router.query;
	const jobId = typeof id === 'string' ? id : null;
	const { job, isLoading, error, refresh } = useJob(jobId);
	const { verifyOnChain, verifying } = useVerification();
	const currentAccount = useCurrentAccount();
	const [certificate, setCertificate] = useState<any>(null);

	const handleVerify = async () => {
		if (!job || !job.teeSignature) {
			toast.error('Job has no proof to verify');
			return;
		}

		if (!currentAccount) {
			toast.error('Please connect your wallet first');
			return;
		}

		try {
			const result = await verifyOnChain(
				job.id,
				job.modelId,
				job.result,
				job.inputHash,
				job.timestamp || Date.now(),
				job.result?.metadata?.modelVersion || 'v1.0.0',
				job.result?.metadata?.inferenceTimeMs || 0,
				job.teeSignature
			);

			// Parse certificate from transaction events
			if (result?.events) {
				const certEvent = result.events.find((e: any) => e.type.includes('CertificateIssued'));
				if (certEvent) {
					setCertificate(certEvent.parsedJson);
				}
			}

			// Refresh job to get updated verification status
			await refresh();

			toast.success('Verification successful!');
		} catch (err) {
			console.error('Verification failed:', err);
			toast.error('Verification failed');
		}
	};

	if (isLoading) {
		return (
			<Layout title="Loading Job...">
				<div className="container mx-auto px-4 py-8">
					<div className="max-w-4xl mx-auto text-center py-20">
						<div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600" />
						<p className="mt-4 text-gray-600">Loading job details...</p>
					</div>
				</div>
			</Layout>
		);
	}

	if (error || !job) {
		return (
			<Layout title="Job Not Found">
				<div className="container mx-auto px-4 py-8">
					<div className="max-w-4xl mx-auto text-center py-20">
						<svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<h2 className="mt-4 text-2xl font-bold text-gray-900">Job Not Found</h2>
						<p className="mt-2 text-gray-600">The job you're looking for doesn't exist or has been deleted.</p>
						<button
							onClick={() => router.push('/')}
							className="mt-6 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
						>
							Go Home
						</button>
					</div>
				</div>
			</Layout>
		);
	}

	return (
		<Layout title={`Job ${job.id.slice(0, 8)}... - SynapseModel`}>
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-4xl mx-auto">
					{/* Back Button */}
					<button
						onClick={() => router.back()}
						className="mb-6 text-gray-600 hover:text-gray-900 flex items-center space-x-2"
					>
						<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
							<path
								fillRule="evenodd"
								d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
								clipRule="evenodd"
							/>
						</svg>
						<span>Back</span>
					</button>

					{/* Job Header */}
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">Job Details</h1>
						<p className="text-gray-600">Job ID: {job.id}</p>
					</div>

					{/* Job Status Card */}
					<div className="mb-6">
						<JobStatus job={job} detailed />
					</div>

					{/* Job Information */}
					<div className="bg-white rounded-lg shadow-md p-6 mb-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-4">Job Information</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
								<p className="text-gray-900">{job.modelId}</p>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
								<p className="text-gray-900">{job.status}</p>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
								<p className="text-gray-900">{new Date(job.createdAt).toLocaleString()}</p>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
								<p className="text-gray-900">{new Date(job.updatedAt).toLocaleString()}</p>
							</div>
						</div>

						{/* Input Data */}
						<div className="mt-6">
							<label className="block text-sm font-medium text-gray-700 mb-2">Input Data</label>
							<pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
								{JSON.stringify(job.inputData, null, 2)}
							</pre>
						</div>

						{/* Result */}
						{job.result && (
							<div className="mt-6">
								<label className="block text-sm font-medium text-gray-700 mb-2">Result</label>
								<pre className="bg-green-50 p-4 rounded-lg text-sm overflow-x-auto border border-green-200">
									{JSON.stringify(job.result, null, 2)}
								</pre>
							</div>
						)}

						{/* Error */}
						{job.error && (
							<div className="mt-6">
								<label className="block text-sm font-medium text-red-700 mb-2">Error</label>
								<div className="bg-red-50 p-4 rounded-lg text-sm border border-red-200">
									<p className="text-red-800">{job.error}</p>
								</div>
							</div>
						)}
					</div>

					{/* Proof Viewer */}
					{(job.status === Status.COMPLETED || job.status === Status.VERIFIED) && (
						<div className="mb-6">
							<ProofViewer job={job} />
						</div>
					)}

					{/* Verify Button */}
					{job.status === Status.COMPLETED && !job.verificationTxHash && (
						<div className="mb-6">
							<button
								onClick={handleVerify}
								disabled={verifying || !connected}
								className={`w-full py-3 px-6 rounded-lg font-medium transition ${
									verifying || !connected
										? 'bg-gray-300 text-gray-500 cursor-not-allowed'
										: 'bg-purple-600 text-white hover:bg-purple-700'
								}`}
							>
								{verifying ? (
									<span className="flex items-center justify-center">
										<svg
											className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											/>
										</svg>
										Verifying on Sui...
									</span>
								) : !connected ? (
									'Connect Wallet to Verify'
								) : (
									'Verify on Sui Blockchain'
								)}
							</button>
						</div>
					)}

					{/* Trust Certificate */}
					{(certificate || job.verificationTxHash) && (
						<div className="mb-6">
							<TrustCertificate
								certificate={
									certificate || {
										id: job.verificationTxHash,
										jobId: job.id,
										modelId: job.modelId,
										inputHash: job.inputHash,
										resultHash: '0x...',
										enclaveId: '0x...',
										timestampMs: job.timestamp || Date.now(),
										verifiedAt: Date.now(),
										verifier: job.userId,
									}
								}
							/>
						</div>
					)}
				</div>
			</div>
		</Layout>
	);
}
