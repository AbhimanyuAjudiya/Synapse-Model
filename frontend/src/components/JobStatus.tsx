import Link from 'next/link';
import { Job, JobStatus as Status } from '@/types';
import { JOB_STATUS_COLORS } from '@/lib/constants';
import { formatDistance } from 'date-fns';

interface JobStatusProps {
	job: Job;
	detailed?: boolean;
}

export default function JobStatus({ job, detailed = false }: JobStatusProps) {
	const statusColor = JOB_STATUS_COLORS[job.status] || 'bg-gray-100 text-gray-800';

	const getStatusIcon = (status: Status) => {
		switch (status) {
			case Status.COMPLETED:
			case Status.VERIFIED:
				return (
					<svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
						<path
							fillRule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clipRule="evenodd"
						/>
					</svg>
				);
			case Status.PROCESSING:
				return (
					<svg className="w-5 h-5 text-yellow-500 animate-spin" fill="none" viewBox="0 0 24 24">
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						/>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
					</svg>
				);
			case Status.FAILED:
				return (
					<svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
						<path
							fillRule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
							clipRule="evenodd"
						/>
					</svg>
				);
			default:
				return (
					<svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
						<path
							fillRule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
							clipRule="evenodd"
						/>
					</svg>
				);
		}
	};

	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition">
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<div className="flex items-center space-x-3 mb-2">
						{getStatusIcon(job.status)}
						<Link
							href={`/jobs/${job.id}`}
							className="text-lg font-semibold text-gray-900 hover:text-primary-600"
						>
							Job #{job.id.slice(0, 8)}
						</Link>
					</div>

					<div className="flex flex-wrap gap-2 mb-3">
						<span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor}`}>
							{job.status}
						</span>
						<span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
							{job.modelId}
						</span>
						{job.verificationTxHash && (
							<span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
								✓ Verified
							</span>
						)}
					</div>

					{detailed && job.result && (
						<div className="mt-3 p-3 bg-gray-50 rounded-lg">
							<p className="text-sm font-medium text-gray-700 mb-1">Result:</p>
							<pre className="text-xs text-gray-600 overflow-x-auto">
								{JSON.stringify(job.result, null, 2)}
							</pre>
						</div>
					)}
				</div>

				<div className="text-right ml-4">
					<p className="text-xs text-gray-500">
						{formatDistance(new Date(job.createdAt), new Date(), { addSuffix: true })}
					</p>
				</div>
			</div>
		</div>
	);
}
