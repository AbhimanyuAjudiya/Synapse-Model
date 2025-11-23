import { useState } from 'react';
import Layout from '@/components/Layout';
import JobStatus from '@/components/JobStatus';
import { useJobs } from '@/hooks/useJob';
import { useSuiWallet } from '@/hooks/useSuiWallet';
import { JobStatus as Status } from '@/types';

type Filter = Status | 'ALL';

export default function JobsPage() {
	const { wallet, connected } = useSuiWallet();
	const [filterStatus, setFilterStatus] = useState<Filter>('ALL');
	const { jobs, isLoading, refresh } = useJobs(wallet?.address || undefined, 50);

	const filteredJobs =
		filterStatus === 'ALL' ? jobs : jobs.filter((job) => job.status === filterStatus);

	const statusCounts: Record<Filter, number> = {
		ALL: jobs.length,
		PENDING: jobs.filter((j) => j.status === Status.PENDING).length,
		PROCESSING: jobs.filter((j) => j.status === Status.PROCESSING).length,
		COMPLETED: jobs.filter((j) => j.status === Status.COMPLETED).length,
		VERIFIED: jobs.filter((j) => j.status === Status.VERIFIED).length,
		FAILED: jobs.filter((j) => j.status === Status.FAILED).length,
	};

	return (
		<Layout title="Jobs - SynapseModel">
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-6xl mx-auto">
					{/* Header */}
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">All Jobs</h1>
						<p className="text-gray-600">
							{connected ? 'View and manage your inference jobs' : 'Connect your wallet to see your jobs'}
						</p>
					</div>

					{connected ? (
						<>
							{/* Filter Tabs */}
							<div className="bg-white rounded-lg shadow-sm p-4 mb-6">
								<div className="flex flex-wrap gap-2">
									{(['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'VERIFIED', 'FAILED'] as const).map(
										(status) => (
											<button
												key={status}
												onClick={() => setFilterStatus(status)}
												className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
													filterStatus === status
														? 'bg-primary-600 text-white'
														: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
												}`}
											>
												{status} ({statusCounts[status]})
											</button>
										)
									)}
								</div>
							</div>

							{/* Refresh Button */}
							<div className="flex justify-end mb-4">
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

							{/* Jobs List */}
							{isLoading ? (
								<div className="text-center py-20">
									<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
									<p className="mt-4 text-gray-600">Loading jobs...</p>
								</div>
							) : filteredJobs.length > 0 ? (
								<div className="space-y-4">
									{filteredJobs.map((job) => (
										<JobStatus key={job.id} job={job} />
									))}
								</div>
							) : (
								<div className="text-center py-20 bg-white rounded-lg shadow-sm">
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
									<h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
									<p className="mt-1 text-sm text-gray-500">
										{filterStatus === 'ALL'
											? "You haven't submitted any jobs yet."
											: `No ${filterStatus.toLowerCase()} jobs.`}
									</p>
								</div>
							)}
						</>
					) : (
						<div className="text-center py-20 bg-white rounded-lg shadow-sm">
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
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
								/>
							</svg>
							<h3 className="mt-2 text-sm font-medium text-gray-900">Wallet Not Connected</h3>
							<p className="mt-1 text-sm text-gray-500">Please connect your Sui wallet to view your jobs.</p>
						</div>
					)}
				</div>
			</div>
		</Layout>
	);
}
