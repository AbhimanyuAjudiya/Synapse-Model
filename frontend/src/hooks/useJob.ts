import { useState } from 'react';
import useSWR from 'swr';
import { getJob, getJobs } from '@/lib/api';
import { Job } from '@/types';
import { POLL_INTERVAL } from '@/lib/constants';

// Fetch single job with polling for incomplete jobs
export function useJob(jobId: string | null) {
	const shouldPoll = (data: Job | undefined) => {
		if (!data) return false;
		return data.status === 'PENDING' || data.status === 'QUEUED' || data.status === 'PROCESSING';
	};

	const { data, error, isLoading, mutate } = useSWR(
		jobId ? `/jobs/${jobId}` : null,
		() => (jobId ? getJob(jobId) : null),
		{
			refreshInterval: (data) => (shouldPoll(data as Job | undefined) ? POLL_INTERVAL : 0),
			revalidateOnFocus: true,
		}
	);

	return {
		job: data as Job | undefined,
		isLoading,
		error,
		refresh: mutate,
	};
}

// Fetch jobs list for a user
export function useJobs(userId?: string, limit: number = 20) {
	const { data, error, isLoading, mutate } = useSWR(
		userId ? `/jobs?userId=${userId}&limit=${limit}` : `/jobs?limit=${limit}`,
		() => getJobs(userId, limit),
		{
			refreshInterval: 10000, // Refresh every 10 seconds
			revalidateOnFocus: true,
		}
	);

	return {
		jobs: (data as Job[]) || [],
		isLoading,
		error,
		refresh: mutate,
	};
}

// Custom hook for job operations
export function useJobOperations() {
	const [submitting, setSubmitting] = useState(false);
	const [processing, setProcessing] = useState(false);

	return {
		submitting,
		processing,
		setSubmitting,
		setProcessing,
	};
}
