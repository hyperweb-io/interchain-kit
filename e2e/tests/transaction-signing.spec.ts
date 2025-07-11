import { test } from '@playwright/test';

import { RejectWallet, TransactionPage } from './page-models/transaction';

test.describe('Transaction', () => {




  test('should able to send token, send ibc token', async ({ page }) => {
    const txPage = new TransactionPage(page);

    // 導航到頁面
    await txPage.goto();
    await txPage.isLoaded();

    // 獲取發送者錢包並連接
    const osmosisSender = txPage.getSenderWallet('osmosis');
    await osmosisSender.connect();

    const cosmoshubSender = txPage.getSenderWallet('cosmoshub');
    await cosmoshubSender.connect();

    // 獲取接收者並連接
    const receiver = txPage.getReceiverWallet();
    await receiver.connect();
    await receiver.waitForConnectedStatus();

    // 從水龍頭獲取代幣
    await osmosisSender.faucet();
    await osmosisSender.waitForBalanceUpdate(20000);

    await cosmoshubSender.faucet();
    await cosmoshubSender.waitForBalanceUpdate(20000);


    // 發送代幣並檢查接收者餘額
    await osmosisSender.sendToken();
    await osmosisSender.isSendTokenDone();

    await cosmoshubSender.sendToken();
    await cosmoshubSender.isSendTokenDone();

    await receiver.waitForBalanceWithAmount('2222222222');
    await receiver.waitForBalanceWithAmount('1111111111');

  });



  test('should handle rejected transactions correctly', async ({ page }) => {
    const txPage = new TransactionPage(page);

    // 導航到頁面
    await txPage.goto();
    await txPage.isLoaded();

    const receiver = txPage.getReceiverWallet();
    await receiver.connect();
    await receiver.waitForConnectedStatus();

    // 使用 RejectWallet
    const rejectWallet = new RejectWallet(page);
    await rejectWallet.connect();
    await rejectWallet.waitForStatus('status: Connected');

    // 從水龍頭獲取代幣
    await rejectWallet.faucet();
    await rejectWallet.waitForBalanceUpdate(20000);

    // 嘗試發送代幣 (預期會被拒絕)
    await rejectWallet.sendToken();

    // 驗證出現了錯誤消息
    await rejectWallet.verifyErrorContains('error message: reject');
  });

});

