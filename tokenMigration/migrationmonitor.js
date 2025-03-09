import WebSocket from 'ws'
import axios from 'axios'
import parseData from './migrationParse.js?'


let accountsToSubscribe = []
const quickNode =
  'wss://multi-fabled-tab.solana-mainnet.quiknode.pro/e19f04d2ec299390ae02f03387e4eab1cababd54'
const ws = new WebSocket(quickNode)

ws.on('open', async () => {
  console.log('Connected to quickNode WebSocket')
  accountsToSubscribe = '39azUYFWPz3VHgKCf3VChUwbpURdCHRxjWVowf5jUJjg'

  const subscribeMessage = {
    jsonrpc: '2.0',
    id: 1, // Unique ID for each subscription request
    method: 'blockSubscribe',
    params: [
      {
        mentionsAccountOrProgram: accountsToSubscribe,
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
})

// Handle incoming messages from the WebSocket
ws.on('message', async (data) => {
  const parsedData = JSON.parse(data)
  // await axios.post('http://em_api:3000/quick', parsedData)
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
