import { useState } from 'react';
import type { NextPage } from 'next';
import Layout from '@/components/Layout';
import JobSubmitForm from '@/components/JobSubmitForm';
import JobStatus from '@/components/JobStatus';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useJobs } from '@/hooks/useJob';
import { submitJob } from '@/lib/api';
import type { JobSubmitRequest } from '@/types';
import toast from 'react-hot-toast';

const Home: NextPage = () => {
	const currentAccount = useCurrentAccount();
	const { jobs, isLoading: jobsLoading, refresh } = useJobs(currentAccount?.address || undefined);
	const [submitting, setSubmitting] = useState(false);

	// Handle job submission
	const handleJobSubmit = async (formData: JobSubmitRequest) => {
		setSubmitting(true);

		try {
			// Prepare job payload with user wallet address
			const jobPayload: JobSubmitRequest = {
				...formData,
				walletAddress: currentAccount?.address || undefined,
				timestamp: Date.now(),
			};

			// Submit to backend API
			const result = await submitJob(jobPayload);

			console.log('Job submitted successfully:', result);

			// Refresh jobs list
			await refresh();

			// Show success notification
			toast.success(`Job submitted successfully! ID: ${result.id.slice(0, 8)}...`);
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : 'Failed to submit job';
			toast.error(errorMsg);
			console.error('Job submission error:', err);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Layout title="SynapseModel - Verifiable AI Inference">
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-6xl mx-auto">
					{/* Hero Section */}
					<div className="text-center mb-12">
						<h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
							SynapseModel
						</h1>
						<p className="text-xl text-gray-600 mb-6">Verifiable Off-Chain AI Inference on Sui</p>
						<p className="text-gray-600 max-w-2xl mx-auto">
							Run machine learning models in a Trusted Execution Environment (TEE) and get
							cryptographically signed proofs that can be verified on the Sui blockchain.
						</p>
					</div>

					{/* Features */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
						<div className="bg-white rounded-lg shadow-sm p-6 text-center">
							<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
									<path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
									<path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
								</svg>
							</div>
							<h3 className="font-semibold text-gray-900 mb-2">Secure Computing</h3>
							<p className="text-sm text-gray-600">Models run in AWS Nitro Enclaves with hardware-level isolation</p>
						</div>

						<div className="bg-white rounded-lg shadow-sm p-6 text-center">
							<div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
									<path
										fillRule="evenodd"
										d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<h3 className="font-semibold text-gray-900 mb-2">Verifiable Proofs</h3>
							<p className="text-sm text-gray-600">Every computation is cryptographically signed and verifiable on-chain</p>
						</div>

						<div className="bg-white rounded-lg shadow-sm p-6 text-center">
							<div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
									<path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
								</svg>
							</div>
							<h3 className="font-semibold text-gray-900 mb-2">Multiple Models</h3>
							<p className="text-sm text-gray-600">Support for classification, NLP, and custom ML models</p>
						</div>
					</div>

					{/* Wallet Connection */}
					{!currentAccount ? (
						<div className="text-center mb-8 bg-white rounded-lg shadow-sm p-8">
							<h2 className="text-2xl font-semibold mb-4">Get Started</h2>
							<p className="text-gray-600 mb-6">
								Connect your Sui wallet to submit inference jobs and verify results on-chain
							</p>
							<p className="text-sm text-gray-500">
								Click "Connect Wallet" in the header to get started
							</p>
						</div>
					) : (
						<>
							{/* Job Submission Form */}
							<div className="mb-12">
								<JobSubmitForm onSubmit={handleJobSubmit} loading={submitting} />
							</div>

							{/* Recent Jobs */}
							<div>
								<div className="flex justify-between items-center mb-6">
									<h2 className="text-2xl font-bold text-gray-900">Your Jobs</h2>
									<button
										onClick={() => refresh()}
										className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1"
									>
										<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
											<path
												fillRule="evenodd"
												d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
												clipRule="evenodd"
											/>
										</svg>
										<span>Refresh</span>
									</button>
								</div>

								{jobsLoading ? (
									<div className="text-center py-12">
										<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
										<p className="mt-4 text-gray-600">Loading jobs...</p>
									</div>
								) : jobs.length > 0 ? (
									<div className="space-y-4">
										{jobs.map((job) => (
											<JobStatus key={job.id} job={job} />
										))}
									</div>
								) : (
									<div className="text-center py-12 bg-white rounded-lg shadow-sm">
										<svg
											className="mx-auto h-12 w-12 text-gray-400"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
											/>
										</svg>
										<h3 className="mt-2 text-sm font-medium text-gray-900">No jobs</h3>
										<p className="mt-1 text-sm text-gray-500">
											Get started by submitting your first inference job above.
										</p>
									</div>
								)}
							</div>
						</>
					)}
				</div>
			</div>
		</Layout>
	);
};

export default Home;
