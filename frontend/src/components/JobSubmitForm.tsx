import { useState } from 'react';
import { JobSubmitRequest, Model } from '@/types';
import { AVAILABLE_MODELS } from '@/lib/constants';
import toast from 'react-hot-toast';

interface JobSubmitFormProps {
	onSubmit: (data: JobSubmitRequest) => void;
	loading?: boolean;
	error?: string | null;
}

export default function JobSubmitForm({ onSubmit, loading, error }: JobSubmitFormProps) {
	const [selectedModel, setSelectedModel] = useState<Model | null>(null);
	const [inputData, setInputData] = useState<string>('');
	const [inputType, setInputType] = useState<'text' | 'json'>('text');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!selectedModel) {
			toast.error('Please select a model');
			return;
		}

		if (!inputData.trim()) {
			toast.error('Please provide input data');
			return;
		}

		let parsedInput: any;

		if (inputType === 'json') {
			try {
				parsedInput = JSON.parse(inputData);
			} catch (err) {
				toast.error('Invalid JSON format');
				return;
			}
		} else {
			parsedInput = { text: inputData };
		}

		const jobRequest: JobSubmitRequest = {
			modelId: selectedModel.id,
			inputData: parsedInput,
		};

		onSubmit(jobRequest);
	};

	const handleModelSelect = (model: Model) => {
		setSelectedModel(model);
		setInputType(model.inputType === 'text' ? 'text' : 'json');
	};

	return (
		<div className="bg-white rounded-lg shadow-md p-6">
			<h2 className="text-2xl font-bold mb-6 text-gray-900">Submit Inference Job</h2>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Model Selection */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-3">Select Model</label>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{AVAILABLE_MODELS.filter((m) => m.enabled).map((model) => (
							<button
								key={model.id}
								type="button"
								onClick={() => handleModelSelect(model)}
								className={`p-4 rounded-lg border-2 text-left transition ${
									selectedModel?.id === model.id
										? 'border-primary-600 bg-primary-50'
										: 'border-gray-200 hover:border-primary-300'
								}`}
							>
								<div className="font-semibold text-gray-900">{model.name}</div>
								<div className="text-sm text-gray-600 mt-1">{model.description}</div>
								<div className="text-xs text-gray-500 mt-2">
									{model.version} • {model.outputType}
								</div>
							</button>
						))}
					</div>
				</div>

				{/* Input Data */}
				{selectedModel && (
					<div>
						<div className="flex justify-between items-center mb-3">
							<label className="block text-sm font-medium text-gray-700">Input Data</label>
							<div className="flex space-x-2">
								<button
									type="button"
									onClick={() => setInputType('text')}
									className={`px-3 py-1 rounded text-xs ${
										inputType === 'text'
											? 'bg-primary-600 text-white'
											: 'bg-gray-200 text-gray-700'
									}`}
								>
									Text
								</button>
								<button
									type="button"
									onClick={() => setInputType('json')}
									className={`px-3 py-1 rounded text-xs ${
										inputType === 'json'
											? 'bg-primary-600 text-white'
											: 'bg-gray-200 text-gray-700'
									}`}
								>
									JSON
								</button>
							</div>
						</div>

						{inputType === 'text' ? (
							<textarea
								value={inputData}
								onChange={(e) => setInputData(e.target.value)}
								rows={4}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
								placeholder={
									selectedModel.id === 'sentiment-analysis'
										? 'Enter text to analyze...'
										: 'Enter your input...'
								}
							/>
						) : (
							<textarea
								value={inputData}
								onChange={(e) => setInputData(e.target.value)}
								rows={6}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
								placeholder='{"data": [0.1, 0.2, ...]}'
							/>
						)}

						{selectedModel.id === 'mnist-classifier' && (
							<p className="mt-2 text-sm text-gray-600">
								Example:{' '}
								<code className="bg-gray-100 px-2 py-1 rounded">
									{`{"pixels": [0, 0, 1, ..., 255]}`}
								</code>{' '}
								(784 values)
							</p>
						)}
					</div>
				)}

				{/* Error Message */}
				{error && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-4">
						<p className="text-sm text-red-800">{error}</p>
					</div>
				)}

				{/* Submit Button */}
				<button
					type="submit"
					disabled={loading || !selectedModel}
					className={`w-full py-3 px-6 rounded-lg font-medium transition ${
						loading || !selectedModel
							? 'bg-gray-300 text-gray-500 cursor-not-allowed'
							: 'bg-primary-600 text-white hover:bg-primary-700'
					}`}
				>
					{loading ? (
						<span className="flex items-center justify-center">
							<svg
								className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
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
							Submitting...
						</span>
					) : (
						'Submit Job'
					)}
				</button>
			</form>
		</div>
	);
}
