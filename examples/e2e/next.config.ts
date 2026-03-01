import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@interchain-kit/core',
    '@interchain-kit/react',
    '@interchain-kit/store',
    '@interchain-kit/keplr-extension',
    '@interchain-kit/metamask-extension',
    '@interchain-kit/mock-wallet',
    '@interchainjs/cosmos',
    '@interchainjs/types',
    '@interchainjs/utils',
    '@interchainjs/auth',
    '@interchainjs/crypto',
    '@interchainjs/encoding',
    '@interchainjs/math',
    '@interchainjs/pubkey',
    '@interchainjs/amino',
    '@interchainjs/ethereum',
    'interchainjs',
  ],
};

export default nextConfig;
