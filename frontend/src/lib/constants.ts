export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const SUI_NETWORK = process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet';

export const CONTRACT_ADDRESSES = {
	ENCLAVE_PACKAGE_ID: process.env.NEXT_PUBLIC_ENCLAVE_PACKAGE_ID || '',
	APP_PACKAGE_ID: process.env.NEXT_PUBLIC_APP_PACKAGE_ID || '',
	ENCLAVE_CONFIG_ID: process.env.NEXT_PUBLIC_ENCLAVE_CONFIG_ID || '',
};

export const AVAILABLE_MODELS = [
	{
		id: 'mnist-classifier',
		name: 'MNIST Digit Classifier',
		description: 'Classify handwritten digits (0-9)',
		version: 'v1.0.0',
		inputType: 'image' as const,
		outputType: 'classification' as const,
		enabled: true,
	},
	{
		id: 'sentiment-analysis',
		name: 'Sentiment Analysis',
		description: 'Analyze sentiment of text (positive/negative/neutral)',
		version: 'v1.0.0',
		inputType: 'text' as const,
		outputType: 'classification' as const,
		enabled: true,
	},
	{
		id: 'image-classifier',
		name: 'Image Classifier',
		description: 'Classify images into categories',
		version: 'v1.0.0',
		inputType: 'image' as const,
		outputType: 'classification' as const,
		enabled: false,
	},
];

export const JOB_STATUS_COLORS = {
	PENDING: 'bg-gray-100 text-gray-800',
	QUEUED: 'bg-blue-100 text-blue-800',
	PROCESSING: 'bg-yellow-100 text-yellow-800',
	COMPLETED: 'bg-green-100 text-green-800',
	FAILED: 'bg-red-100 text-red-800',
	VERIFIED: 'bg-purple-100 text-purple-800',
};

export const POLL_INTERVAL = 5000; // 5 seconds
export const MAX_RETRIES = 3;
