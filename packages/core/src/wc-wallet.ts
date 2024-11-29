import { Algo, SimpleAccount, Wallet, WcEventTypes, WcProviderEventType } from './types/wallet';
import { BaseWallet } from "./base-wallet";
import { WalletAccount, SignOptions, DirectSignDoc, BroadcastMode, DAppInfoForWalletConnect } from "./types";
import { SignClient } from '@walletconnect/sign-client';
import { PairingTypes, SessionTypes, SignClientTypes } from '@walletconnect/types';
import { Buffer } from 'buffer'
import { ChainInfo } from '@keplr-wallet/types'
import {
  OfflineAminoSigner,
  OfflineDirectSigner,
} from '@interchainjs/cosmos/types/wallet';
import { AminoSignResponse, StdSignature, DirectSignResponse } from '@interchainjs/cosmos/types/wallet';
import { StdSignDoc } from '@interchainjs/types'
import { WalletConnectIcon } from './constant';

export class WCWallet extends BaseWallet {

  pairingUri: string;

  session: SessionTypes.Struct;

  signClient: InstanceType<typeof SignClient>;

  pairingToConnect: PairingTypes.Struct = null

  walletConnectOption: SignClientTypes.Options

  constructor({
    option,
    walletConnectOption,
  }: {
    option?: Wallet,
    walletConnectOption?: SignClientTypes.Options
  } = {}) {
    const defaultWalletConnectOption: Wallet = {
      name: 'WalletConnect',
      prettyName: 'Wallet Connect',
      mode: 'wallet-connect',
      logo: WalletConnectIcon
    }

    super({ ...defaultWalletConnectOption, ...option })

    this.walletConnectOption = walletConnectOption
  }

  override async init(): Promise<void> {
    this.events.removeAllListeners()

    const defaultOption = {
      projectId: '15a12f05b38b78014b2bb06d77eecdc3',
      // optional parameters
      relayUrl: 'wss://relay.walletconnect.org',
      metadata: {
        name: 'Example Dapp',
        description: 'Example Dapp',
        url: '#',
        icons: ['https://walletconnect.com/walletconnect-logo.png']
      }
    }

    this.signClient = await SignClient.init({ ...defaultOption, ...this.walletConnectOption })
    this.bindingEvent()
  }

  async removePairing() {
    const pairings = this.signClient.pairing.getAll()

    for (const pairing of pairings) {
      await this.signClient.pairing.delete(pairing.topic, {
        code: 7001,
        message: 'disconnect'
      })
    }
  }

  async removeSession() {
    const sessions = this.signClient.session.getAll()
    for (const session of sessions) {
      await this.signClient.session.delete(session.topic, {
        code: 6000,
        message: 'user disconnect.'
      })
    }
  }

  getLatestSession() {
    return this.signClient.session.getAll().pop()
  }

  getLatestPairing() {
    return this.signClient.pairing.getAll({ active: true }).pop()
  }

  getActivePairing(): PairingTypes.Struct[] {
    if (!this.signClient) {
      return []
    }
    return this.signClient.pairing.getAll({ active: true })
  }

  setPairingToConnect(pairing: PairingTypes.Struct) {
    this.pairingToConnect = pairing
  }

  async connect(chainIds: string | string[]) {

    const chainIdsWithNS = Array.isArray(chainIds) ? chainIds.map((chainId) => `cosmos:${chainId}`) : [`cosmos:${chainIds}`]

    let session

    if (this.session && this.pairingToConnect && this.session.peer.metadata.name !== this.pairingToConnect.peerMetadata.name) {
      // if session exist and pairingToConnect exist same time
      // check if the session is the same as pairingToConnect
      // if not, remove the session and connect to pairingToConnect
      await this.removeSession()
    }

    try {
      session = this.getLatestSession()
      if (session) {
        this.session = session
      } else {
        await this.removeSession()
        const { uri, approval } = await this.signClient.connect({
          pairingTopic: this.pairingToConnect?.topic,
          requiredNamespaces: {
            cosmos: {
              methods: [
                'cosmos_getAccounts',
                'cosmos_signAmino',
                'cosmos_signDirect',
              ],
              chains: chainIdsWithNS,
              events: ['chainChanged', 'accountsChanged']
            },
          }
        })
        this.pairingUri = uri
        this.events.emit('displayWalletConnectQRCodeUri', uri)

        session = await approval()
        this.session = session
        this.pairingUri = null
      }

    } catch (error) {
      throw error
    }
  }

  async disconnect(): Promise<void> {
    // await this.removePairing()
    await this.removeSession()
  }

  getAccounts(): Promise<WalletAccount[]> {
    const accounts: WalletAccount[] = []

    const namespaces = this.session.namespaces

    Object.entries(namespaces).forEach(([namespace, session]: [string, SessionTypes.BaseNamespace]) => {
      session.accounts.forEach((account: string) => {
        const [namespace, chainId, address] = account.split(':')
        accounts.push({
          address: address,
          algo: 'secp256k1',
          pubkey: null,
          username: '',
          isNanoLedger: null,
          isSmartContract: null
        })
      })
    })

    return Promise.resolve(accounts)
  }

  override async getSimpleAccount(chainId: string): Promise<SimpleAccount> {
    const accounts: SimpleAccount[] = []

    const namespaces = this.session.namespaces

    Object.entries(namespaces).forEach(([namespace, session]: [string, SessionTypes.BaseNamespace]) => {
      session.accounts.forEach((account: string) => {
        const [namespace, chainId, address] = account.split(':')
        accounts.push({
          namespace,
          chainId,
          address,
        })
      })
    })

    return Promise.resolve(accounts.find((account) => account.chainId === chainId))
  }

  override async getAccount(chainId: string): Promise<WalletAccount> {
    try {
      if (!this.signClient || !this.session?.topic) {
        return;
      }
      const accounts = await this.signClient.request({
        topic: this.session?.topic,
        request: {
          method: 'cosmos_getAccounts',
          params: {}
        },
        chainId: `cosmos:${chainId}`
      }) as any[]

      const { address, algo, pubkey } = accounts[0]

      return {
        address,
        algo: algo as Algo,
        pubkey: new Uint8Array(Buffer.from(pubkey, 'base64')),
      }
    } catch (error) {
      this.errorMessage = (error as any).message
      throw error
    }
  }

  getOfflineSignerAmino(chainId: string): OfflineAminoSigner {
    return {
      getAccounts: async () => [await this.getAccount(chainId)],
      signAmino: (signerAddress: string, signDoc: StdSignDoc) =>
        this.signAmino(chainId, signerAddress, signDoc),
    }
  }

  getOfflineSignerDirect(chainId: string): OfflineDirectSigner {
    return {
      getAccounts: async () => [await this.getAccount(chainId)],
      signDirect: (signerAddress: string, signDoc: DirectSignDoc) =>
        this.signDirect(chainId, signerAddress, signDoc),
    }
  }

  override async signAmino(chainId: string, signer: string, signDoc: StdSignDoc, signOptions?: SignOptions): Promise<AminoSignResponse> {
    try {
      const result = await this.signClient.request({
        topic: this.session.topic,
        chainId: `cosmos:${chainId}`,
        request: {
          method: 'cosmos_signAmino',
          params: {
            signerAddress: signer,
            signDoc,
          },
        },
      });
      return result as AminoSignResponse
    } catch (error) {
      console.log(error)
    }
  }

  signArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<StdSignature> {
    throw new Error("Method not implemented.");
  }

  verifyArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  signDirect(chainId: string, signer: string, signDoc: DirectSignDoc, signOptions?: SignOptions): Promise<DirectSignResponse> {
    const signDocValue = {
      signerAddress: signer,
      signDoc: {
        chainId: signDoc.chainId,
        bodyBytes: Buffer.from(signDoc.bodyBytes).toString('base64'),
        authInfoBytes: Buffer.from(signDoc.authInfoBytes).toString(
          'base64'
        ),
        accountNumber: signDoc.accountNumber.toString(),
      },
    };

    return this.signClient.request({
      topic: this.session.topic,
      chainId: `cosmos:${chainId}`,
      request: {
        method: 'cosmos_signDirect',
        params: signDocValue,
      },
    });
  }

  sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode): Promise<Uint8Array> {
    throw new Error("Method not implemented.");
  }

  sign(chainId: string, message: string): Promise<any> {
    throw new Error("Method not implemented.");
  }

  addSuggestChain(chainInfo: ChainInfo): Promise<void> {
    throw new Error('Method not implemented.');
  }

  bindingEvent(): void {
    this.events.removeAllListeners()
    const events = [...Object.keys(WcEventTypes), ...Object.keys(WcProviderEventType)]
    // for (const event of events) {
    //   this.signClient.core.on(event, (data: never) => {
    //     this.events.emit(event, data)

    //     if (event === 'accountsChanged') {
    //       this.events.emit('keystoreChange')
    //     }

    //   })
    // }

    // this.signClient.events.on('session_event', (data: SignClientTypes.EventArguments['session_event']) => {
    //   console.log('session_event_trigger', data)
    //   this.events.emit('accountChanged', data)
    // })

    for (const event of events) {
      // console.log(event)
      this.signClient.on(event as string, (data: any) => {
        console.log(event, data)
      })
    }

  }

  unbindingEvent(): void {
    this.signClient.events.removeAllListeners('session_event')
    this.events.removeAllListeners()
  }

  async ping() {
    if (!this.signClient) {
      return
    }
    try {
      await this.signClient.ping({
        topic: this.session.topic
      })
      return 'success'
    } catch (error) {
      console.log(error)
      return 'failed'
    }
  }
}


