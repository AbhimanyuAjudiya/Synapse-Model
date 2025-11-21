import { useState, useEffect, useCallback } from 'react';
import { useCurrentAccount, useConnectWallet, useDisconnectWallet } from '@mysten/dapp-kit';
import type { SuiWalletState } from '@/types';

export function useSuiWallet() {
	const currentAccount = useCurrentAccount();
	const { mutate: connect } = useConnectWallet();
	const { mutate: disconnect } = useDisconnectWallet();

	const [state, setState] = useState<SuiWalletState>({
		address: null,
		connected: false,
		connecting: false,
		error: null,
	});

	useEffect(() => {
		if (currentAccount) {
			setState({
				address: currentAccount.address,
				connected: true,
				connecting: false,
				error: null,
			});
		} else {
			setState({
				address: null,
				connected: false,
				connecting: false,
				error: null,
			});
		}
	}, [currentAccount]);

	const handleConnect = useCallback(() => {
		setState((prev) => ({ ...prev, connecting: true, error: null }));
		connect(
			{},
			{
				onSuccess: () => {
					setState((prev) => ({ ...prev, connecting: false }));
				},
				onError: (error) => {
					setState((prev) => ({
						...prev,
						connecting: false,
						error: error.message || 'Failed to connect wallet',
					}));
					console.error('Wallet connection error:', error);
				},
			}
		);
	}, [connect]);

	const handleDisconnect = useCallback(() => {
		disconnect();
		setState({
			address: null,
			connected: false,
			connecting: false,
			error: null,
		});
	}, [disconnect]);

	return {
		wallet: state.address ? { address: state.address } : null,
		connected: state.connected,
		connecting: state.connecting,
		error: state.error,
		connect: handleConnect,
		disconnect: handleDisconnect,
		signAndExecuteTransactionBlock: undefined, // Will be handled by dapp-kit hooks
	};
}
