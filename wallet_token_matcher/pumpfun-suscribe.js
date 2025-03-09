/****
 *
 *  List to the new tokens cretion then if the creator wallet matches one of the new wallets in the database we add the token to the database.
 * Lat Modified: 2024-11-30\\
 * Last modification, changed the  post url from new_token to tokens
 */
//*** */

import axios from 'axios'
import WebSocket from 'ws'
import { subMinutes } from 'date-fns'

const ws = new WebSocket('wss://pumpportal.fun/api/data')

ws.on('open', function open() {
  console.log('Connected to Pumpfun WebSocket')
  // Subscribing to token creation events
  let payload = {
    method: 'subscribeNewToken',
  }
  ws.send(JSON.stringify(payload))
})

ws.on('message', async (data) => {
  try {
    console.log('Checking for new tokens')
    const parsedData = JSON.parse(data)
    const walletResponse = await axios.get(
      'http://app:3000/api/wallets?address=' + parsedData.traderPublicKey
    )

    if (walletResponse.data.length > 0) {
      await axios.post('http://app:3000/api/tokens', {
        mint: parsedData.mint,
        walletId: walletResponse.data[0].id,
        origin: 'minted',
      })
      console.log('Token created successfully:', parsedData.mint)
    }
  } catch (error) {
    console.error('Error processing token:', error.message)
    if (error.response) {
      console.error('Response data:', error.response.data)
    }
  }
})
