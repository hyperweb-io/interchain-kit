import React, { useMemo } from 'react';
import { useWalletManager } from '@interchain-kit/react';
import { isWalletConnectState } from '@interchain-kit/store';

export const SimplifiedWalletStoreExample: React.FC = () => {
  const walletManager = useWalletManager();

  // 获取 WalletConnect 钱包的 QR code URI
  const qrCodeUri = useMemo(() => {
    const walletName = 'wallet-connect';
    const chainName = 'cosmoshub';

    const state = walletManager.getChainWalletState(walletName, chainName);

    if (isWalletConnectState(state)) {
      return state.qrCodeUri;
    }

    return null;
  }, [walletManager]);

  const handleConnect = async () => {
    try {
      await walletManager.connect('wallet-connect', 'cosmoshub');
    } catch (error) {
      console.error('连接失败:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await walletManager.disconnect('wallet-connect', 'cosmoshub');
    } catch (error) {
      console.error('断开连接失败:', error);
    }
  };

  const handleGetAccount = async () => {
    try {
      const account = await walletManager.getAccount(
        'wallet-connect',
        'cosmoshub'
      );
      console.log('账户信息:', account);
    } catch (error) {
      console.error('获取账户失败:', error);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">简化后的 WalletStore 示例</h2>

      <div className="space-y-4">
        <button
          onClick={handleConnect}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          连接 WalletConnect
        </button>

        <button
          onClick={handleDisconnect}
          className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
        >
          断开连接
        </button>

        <button
          onClick={handleGetAccount}
          className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          获取账户信息
        </button>

        {qrCodeUri && (
          <div className="border p-4 rounded">
            <h3 className="font-semibold mb-2">QR Code URI:</h3>
            <p className="text-sm text-gray-600 break-all">{qrCodeUri}</p>
          </div>
        )}

        <div className="text-sm text-gray-500">
          <p>✅ 重构优势：</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>移除了冗余的 ChainWalletStore 层</li>
            <li>直接在 WalletStore 中处理所有逻辑</li>
            <li>代码更简洁，维护更容易</li>
            <li>类型安全得到保持</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
