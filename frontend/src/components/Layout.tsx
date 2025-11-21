import { ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { formatAddress } from '@/lib/sui';

interface LayoutProps {
	children: ReactNode;
	title?: string;
}

export default function Layout({ children, title = 'SynapseModel' }: LayoutProps) {
	const currentAccount = useCurrentAccount();

	return (
		<>
			<Head>
				<title>{title}</title>
				<meta name="description" content="Verifiable AI Inference with TEE" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<div className="min-h-screen bg-gray-50">
				{/* Header */}
				<header className="bg-white shadow-sm sticky top-0 z-50">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex justify-between items-center h-16">
							{/* Logo */}
							<Link href="/" className="flex items-center space-x-3">
								<div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
									<span className="text-white font-bold text-xl">S</span>
								</div>
								<span className="text-xl font-bold text-gray-900">SynapseModel</span>
							</Link>

							{/* Navigation */}
							<nav className="hidden md:flex space-x-8">
								<Link
									href="/"
									className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
								>
									Home
								</Link>
								<Link
									href="/jobs"
									className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
								>
									Jobs
								</Link>
								<Link
									href="/models"
									className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
								>
									Models
								</Link>
								<Link
									href="/docs"
									className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
								>
									Docs
								</Link>
							</nav>

						{/* Wallet Connection */}
						<div className="flex items-center space-x-4">
							<ConnectButton />
						</div>
					</div>
				</div>
			</header>				{/* Main Content */}
				<main className="flex-1">{children}</main>

				{/* Footer */}
				<footer className="bg-white border-t border-gray-200 mt-auto">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
							<div>
								<h3 className="text-sm font-semibold text-gray-900 mb-4">About</h3>
								<p className="text-sm text-gray-600">
									SynapseModel provides verifiable off-chain AI inference using Trusted Execution
									Environments on the Sui blockchain.
								</p>
							</div>
							<div>
								<h3 className="text-sm font-semibold text-gray-900 mb-4">Resources</h3>
								<ul className="space-y-2">
									<li>
										<Link href="/docs" className="text-sm text-gray-600 hover:text-primary-600">
											Documentation
										</Link>
									</li>
									<li>
										<a
											href="https://github.com"
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm text-gray-600 hover:text-primary-600"
										>
											GitHub
										</a>
									</li>
									<li>
										<Link href="/api" className="text-sm text-gray-600 hover:text-primary-600">
											API Reference
										</Link>
									</li>
								</ul>
							</div>
							<div>
								<h3 className="text-sm font-semibold text-gray-900 mb-4">Legal</h3>
								<ul className="space-y-2">
									<li>
										<Link href="/privacy" className="text-sm text-gray-600 hover:text-primary-600">
											Privacy Policy
										</Link>
									</li>
									<li>
										<Link href="/terms" className="text-sm text-gray-600 hover:text-primary-600">
											Terms of Service
										</Link>
									</li>
								</ul>
							</div>
						</div>
						<div className="mt-8 pt-8 border-t border-gray-200 text-center">
							<p className="text-sm text-gray-500">© 2025 SynapseModel. Built with Nautilus &amp; Sui.</p>
						</div>
					</div>
				</footer>
			</div>
		</>
	);
}
