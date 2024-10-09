import { Link, Outlet, Route, Routes } from "react-router-dom";
import E2ETest from "./pages/all-wallets";
import ActiveWallet from "./pages/active-wallet";
import WalletConnect from "./pages/wallet-connect";
import UseChain from './pages/use-chain';

function Layout() {
  return <Outlet />
}

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<E2ETest />} />
          <Route path='active-wallet' element={<ActiveWallet />} />
          <Route path='wallet-connect' element={<WalletConnect />} />
          <Route path='use-chain' element={<UseChain />} />
        </Route>
      </Routes>
    </div>
  )
}