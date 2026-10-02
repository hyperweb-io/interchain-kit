import { WalletManagerStore } from '@interchain-kit/store';

export type SigningClient = Awaited<ReturnType<WalletManagerStore['getSigningClient']>>
