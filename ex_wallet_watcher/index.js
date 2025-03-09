/***
 *
 * This script connects to the Chainstack WebSocket endpoint and subscribes to block notifications for a list of  new wallets, then adds the new walles informations to the database
 */

import WebSocket from 'ws'
import { resquestExchages, parseData } from './dataParser.js'

let accountsToSubscribe = []
const chainstackEndpoint =
  'wss://solana-mainnet.core.chainstack.com/5f69ed660425a1f43c2db24a36a951bd'
//'wss://solana-mainnet.core.chainstack.com/8752b7f0e9bf21682d391125f4f70046'
const ws = new WebSocket(chainstackEndpoint)

const func = (account, index) => {
  const subscribeMessage = {
    jsonrpc: '2.0',
    id: index + 1, // Unique ID for each subscription request
    method: 'blockSubscribe',
    params: [
      {
        mentionsAccountOrProgram: account.address, // Single account per request
      },
      {
        commitment: 'confirmed',
        encoding: 'jsonParsed',
        showRewards: false,
        transactionDetails: 'full',
        maxSupportedTransactionVersion: 0,
      },
    ],
  }

  ws.send(JSON.stringify(subscribeMessage))
  console.log(`Subscribed to block notifications for account: ${account}`)
}
let reqs = 0,
  maxReg = 5

async function getAccounts(attempts = 0) {
  const accounts = await resquestExchages()

  if (accounts.length === 0 && attempts < maxReg) {
    console.log(
      `Attempt ${attempts + 1}: No accounts found, retrying in 1 minute...`
    )
    await new Promise((resolve) => setTimeout(resolve, 60000)) // Wait 5 seconds before retry
    return getAccounts(attempts + 1)
  }

  return accounts
}

ws.on('open', async () => {
  console.log('Connected to Chainstack WebSocket')
  accountsToSubscribe = await getAccounts()

  if (accountsToSubscribe.length > 0) {
    accountsToSubscribe.forEach(func)
  } else {
    console.log('Failed to get accounts after maximum retries')
  }
})

// Handle incoming messages from the WebSocket
ws.on('message', (data) => {
  const parsedData = JSON.parse(data)
  parseData(parsedData)
})

// Handle errors in the WebSocket connection
ws.on('error', (error) => {
  console.error('WebSocket error:', error)
})

// Handle WebSocket close event
ws.on('close', () => {
  console.log('WebSocket connection closed.')
})
