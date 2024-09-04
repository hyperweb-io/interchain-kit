import { HttpEndpoint } from "@cosmjs/stargate"

const checkRpcEndpoint = async (endpoint: string | HttpEndpoint) => {
  if (typeof endpoint === 'string') {
    return fetch(`${endpoint}`, { method: 'HEAD' })
  } else {
    return fetch(`${endpoint}`, { method: 'HEAD', headers: endpoint.headers })
  }
}

export const isValidRpcEndpoint = async (endpoint: string | HttpEndpoint) => {
  try {
    const res = await checkRpcEndpoint(endpoint)
    return res.status === 200
  } catch (error) {
    // console.error(error)
    return false
  }
}

export const getValidRpcEndpoint = async (endpoints: (string | HttpEndpoint)[]) => {
  let rpc: string | HttpEndpoint = ''
  for (const endpoint of endpoints) {
    try {
      const res = await checkRpcEndpoint(endpoint)
      if (res.status === 200) {
        rpc = endpoint
        break
      }
    } catch (error) {
      // console.error(error)
    }
  }
  return rpc
}

const checkRestEndpoint = async (endpoint: string | HttpEndpoint) => {
  if (typeof endpoint === 'string') {
    return fetch(`${endpoint}/cosmos/base/tendermint/v1beta1/node_info`, { method: "HEAD" })
  } else {
    return fetch(`${endpoint}/cosmos/base/tendermint/v1beta1/node_info`, { method: "HEAD", headers: endpoint.headers })
  }
}

export const isValidRestEndpoint = async (endpoint: string | HttpEndpoint) => {
  try {
    const res = await checkRestEndpoint(endpoint)
    return res.status === 200
  } catch (error) {
    // console.error(error)
    return false
  }
}

export const getValidRestEndpoint = async (endpoints: (string | HttpEndpoint)[]) => {
  let rest: string | HttpEndpoint = ''
  for (const endpoint of endpoints) {
    try {
      const res = await checkRestEndpoint(endpoint)
      if (res.status === 200) {
        rest = endpoint
        break
      }
    } catch (error) {
      // console.error(error)
    }
  }
  return rest
}
