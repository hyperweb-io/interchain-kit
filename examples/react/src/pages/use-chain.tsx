import { useEffect, useState } from 'react'
import { useChain } from '@interchain-kit/react'
import { Button } from '@interchain-ui/react';

export default function() {
    const [chainName, setChainName] = useState("osmosis");
    const {logoUrl, address, status, username, openView, getRpcEndpoint } = useChain(chainName);

    useEffect(() => {
        if (getRpcEndpoint) {
            getRpcEndpoint().then(res => {
                console.log('rpc:', res)
            })
        }
    }, [getRpcEndpoint])

    useEffect(() => {
        if (logoUrl) {
            console.log(logoUrl)
        }
    }, [logoUrl])

    return (
        <div className="space-y-4 mx-auto max-w-3xl">
            <h1 className="text-2xl font-semibold">useChain usage:</h1>
            <select
                value={chainName}
                onChange={(e) => setChainName(e.target.value)}
                className="h-9 px-3 mr-4 border rounded-md shadow-sm"
            >
                <option value="juno">Juno</option>
                <option value="osmosis">Osmosis</option>
                <option value="stargaze">Stargaze</option>
                <option value="cosmoshub">Cosmos Hub</option>
            </select>
            <div className="flex items-center">
                logo: <img className="w-[20px] h-[20px]" src={logoUrl} alt="logoUrl" />
            </div>
            <div>
            rpcEndpoint: { getRpcEndpoint }
            </div>
            <div>
            wallet status: { status }
            </div>
            <div>
            username: {username}
            </div>
            <div className="flex items-center">
                account address: { address || <Button onClick={openView}>connect to wallet</Button> }
            </div>
        </div>
    )
}