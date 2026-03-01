# Interchain Kit E2E 測試

此目錄包含使用 [Playwright](https://playwright.dev/) 編寫的端到端測試，用於測試 Interchain Kit 的功能和使用者界面。

## 準備環境

首先，確保已安裝所有依賴：

```bash
# 在專案根目錄運行
pnpm install

# 安裝 Playwright 瀏覽器
cd e2e
npx playwright install
```

## 運行測試

可以通過以下命令運行 E2E 測試：

```bash
# 在專案根目錄運行
pnpm test:e2e                    # 運行所有測試 (無頭模式)
pnpm test:e2e:headed             # 運行所有測試 (有頭模式，可以看到瀏覽器界面)
pnpm test:e2e:ui                 # 使用 Playwright UI 模式運行 (可視化測試界面)
pnpm test:e2e:debug              # 調試模式運行測試

# 運行特定測試類別
pnpm test:e2e --grep "錢包發現和連接測試"       # 僅運行錢包發現與連接測試
pnpm test:e2e --grep "交易簽名流程測試"        # 僅運行交易簽名流程測試
pnpm test:e2e --grep "跨鏈用戶體驗測試"        # 僅運行跨鏈用戶體驗測試
pnpm test:e2e --grep "回歸測試/UI 案例"       # 僅運行回歸/UI測試
```

## 測試報告

測試完成後，可以通過以下命令查看報告：

```bash
cd e2e
npx playwright show-report
```

## 測試檔案結構

- `tests/1-wallet-discovery.spec.ts` - 錢包發現與連接測試
- `tests/2-transaction-signing.spec.ts` - 交易簽名流程測試
- `tests/3-cross-chain-ux.spec.ts` - 跨鏈用戶體驗測試
- `tests/4-regression-ui.spec.ts` - UI 回歸測試
- `tests/basic.spec.ts` - 基本功能測試
- `tests/wallet-connection.spec.ts` - 錢包連接相關測試
- `tests/interchain-operations.spec.ts` - 鏈間操作測試
- `tests/utils/test-utils.ts` - 測試工具函數

## 添加新的測試

創建新的測試文件在 `tests` 目錄下，使用 `.spec.ts` 作為文件後綴。可以參考現有的測試文件結構。

## 配置

Playwright 配置在 `playwright.config.ts` 文件中，包括：

- 測試瀏覽器：Chrome、Firefox、Safari、移動裝置等
- 基本 URL: `http://localhost:5173` (React 範例應用程式)
- 測試並行運行設置
- 螢幕截圖和視頻錄製設置

## CI 集成

GitHub Actions 工作流已配置，每次提交到 main/master 分支或創建 PR 時自動運行 E2E 測試。
