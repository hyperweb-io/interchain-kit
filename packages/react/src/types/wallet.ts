import { BaseWallet } from "@interchain-kit/core";
import { ConnectState } from "../enum";

export type UseWalletReturnType = {
    wallet: BaseWallet;
    connect: (chainId: string | string[]) => void;
    connectState: ConnectState;
}

export type WalletState = {
    name: string;
    connectState: ConnectState
}