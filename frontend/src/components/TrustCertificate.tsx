import { TrustCertificate as Certificate } from '@/types';
import { formatAddress } from '@/lib/sui';

interface TrustCertificateProps {
	certificate: Certificate;
}

export default function TrustCertificate({ certificate }: TrustCertificateProps) {
	return (
		<div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200 p-6">
			<div className="flex items-center space-x-3 mb-6">
				<div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
					<svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
						<path
							fillRule="evenodd"
							d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clipRule="evenodd"
						/>
					</svg>
				</div>
				<div>
					<h3 className="text-xl font-bold text-gray-900">Trust Certificate</h3>
					<p className="text-sm text-gray-600">Verified by Sui Blockchain</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label className="block text-xs font-medium text-gray-600 mb-1">Certificate ID</label>
					<p className="text-sm font-mono text-gray-900">{formatAddress(certificate.id, 8)}</p>
				</div>

				<div>
					<label className="block text-xs font-medium text-gray-600 mb-1">Job ID</label>
					<p className="text-sm font-mono text-gray-900">{formatAddress(certificate.jobId, 8)}</p>
				</div>

				<div>
					<label className="block text-xs font-medium text-gray-600 mb-1">Model ID</label>
					<p className="text-sm text-gray-900">{certificate.modelId}</p>
				</div>

				<div>
					<label className="block text-xs font-medium text-gray-600 mb-1">Enclave ID</label>
					<p className="text-sm font-mono text-gray-900">{formatAddress(certificate.enclaveId, 8)}</p>
				</div>

				<div>
					<label className="block text-xs font-medium text-gray-600 mb-1">Verified At</label>
					<p className="text-sm text-gray-900">{new Date(certificate.verifiedAt).toLocaleString()}</p>
				</div>

				<div>
					<label className="block text-xs font-medium text-gray-600 mb-1">Verifier</label>
					<p className="text-sm font-mono text-gray-900">{formatAddress(certificate.verifier, 8)}</p>
				</div>
			</div>

			<div className="mt-6 pt-6 border-t border-purple-200">
				<div className="flex items-center justify-between">
					<span className="text-sm font-medium text-gray-700">Result Hash</span>
					<code className="text-xs font-mono bg-white px-2 py-1 rounded border border-purple-200">
						{formatAddress(certificate.resultHash, 10)}
					</code>
				</div>
			</div>
		</div>
	);
}
