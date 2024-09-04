# core

<p align="center">
  <img src="https://user-images.githubusercontent.com/545047/188804067-28e67e5e-0214-4449-ab04-2e0c564a6885.svg" width="80"><br />
    cosmos-kit wallet connector core package
</p>

## install

```sh
npm install core
```
## Table of contents

- [core](#core)
  - [Install](#install)
  - [Table of contents](#table-of-contents)
- [Developing](#developing)
- [Credits](#credits)

## Developing

When first cloning the repo:

```
yarn
yarn build
```

## Related

Checkout these related projects:

* [@cosmology/telescope](https://github.com/cosmology-tech/telescope) Your Frontend Companion for Building with TypeScript with Cosmos SDK Modules.
* [@cosmwasm/ts-codegen](https://github.com/CosmWasm/ts-codegen) Convert your CosmWasm smart contracts into dev-friendly TypeScript classes.
* [chain-registry](https://github.com/cosmology-tech/chain-registry) Everything from token symbols, logos, and IBC denominations for all assets you want to support in your application.
* [cosmos-kit](https://github.com/cosmology-tech/cosmos-kit) Experience the convenience of connecting with a variety of web3 wallets through a single, streamlined interface.
* [create-cosmos-app](https://github.com/cosmology-tech/create-cosmos-app) Set up a modern Cosmos app by running one command.
* [interchain-ui](https://github.com/cosmology-tech/interchain-ui) The Interchain Design System, empowering developers with a flexible, easy-to-use UI kit.
* [starship](https://github.com/cosmology-tech/starship) Unified Testing and Development for the Interchain.

## Credits

🛠 Built by Cosmology — if you like our tools, please consider delegating to [our validator ⚛️](https://cosmology.zone/validator)


## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED “AS IS”, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.

## Overview

```mermaid
classDiagram
    class InterChainWallet{
        <<abstract>>
        - walletInstance
        +init()
        +getCosmosNetworkAminoSigner(chainId)
        +getCosmosNetworkDirectSigner(chainId)
        +getEthermintNetworkAminoSigner(chainId)
        +getEthermintNetworkDirectSigner(chainId)
        +getEthermintNetworkEIP712Signer(chainId)
        +getEthereumNetworkAminoSigner(chainId)
        +getEthereumNetworkDirectSigner(chainId)
        +getSigner(chainId)

        +signCosmosAmino(chainId,signer,signDoc,signOption)
        +signCosmosDirect(chainId,signer,signDoc,signOption)
        +signEthermintAmino(chainId,signer,signDoc,signOption)
        +signEthermintDriect(chainId,signer,signDoc,signOption)
        +signEthermintEIP712(chainId,signer,signDoc,signOption)
        +signEthereumAmino(chainId,signer,signDoc,signOption)
        +signEthereumDirect(chainId,signer,signDoc,signOption)
        +signArbitrary(chainId,signer,data)
    }

    InterChainWallet <|-- ExtensionWallet
    InterChainWallet <|-- MobileWallet

    class ExtensionWallet {

    }
    class MobileWallet {
      +ISignClient singClient
    }

    ExtensionWallet <|-- KeplrExtensionWallet
    ExtensionWallet <|-- LeapExtensionWallet

    MobileWallet <|-- KeplrMobileWallet
    MobileWallet <|-- LeapMobileWallet

    class KeplrExtensionWallet {

    }
    class KeplrMobileWallet {

    }

    class LeapExtensionWallet {

    }
    class LeapMobileWallet {

    }

    class CosmosSigner {
      <<interface>>
    }
    class EthereumSinger {
      <<interface>>
    }
    class EthermintSIgner {
      <<interface>>
    }


```
