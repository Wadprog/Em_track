import axios from 'axios'
const MINSOL = 0.05 // 2 SOL
export const resquestExchages = async () => {
  // try {
  //   const response = await axios.get('http://app:3000/api/exchanges')
  //   return response.data
  // } catch (e) {
  //   console.log('[ERROR] while fetching exchanges')
  //   console.log(e.message)
  return Promise.resolve([
    {
      id: '1',
      address: '5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9',
      name: 'Binance 2',
    },
    {
      id: '2',
      address: 'G2YxRa6wt1qePMwfJzdXZG62ej4qaTC7YURzuh2Lwd3t',
      name: 'Random Exchange',
    },
    {
      id: '3',
      address: 'AC5RDfQFmDS1deWZos921JfqscXdByf8BKHs5ACWjtW2',
      name: 'Bybit',
    },
  ])
  // }
}

const getTransactionMatchingLimport = (
  preBalances,
  postBalances,
  lamportsAmount
) => {
  let isNewWallet = false

  preBalances.forEach((amount, index) => {
    if (amount === 0 && postBalances[index] === lamportsAmount) {
      isNewWallet = true
    }
  })

  return {
    isNewWallet,
  }
}

export const parseData = async (data) => {
  if (data.method !== 'blockNotification' || !data?.params.result) return

  const accountsToSubscribe = await resquestExchages()
  const { value } = data.params.result
  let tx_with_transfer = null
  let info = null
  let account_from = null
  value?.block?.transactions?.forEach((tx) => {
    if (tx.transaction?.message?.instructions?.length) {
      tx.transaction.message.instructions.forEach((ins) => {
        if (ins.parsed?.type === 'transfer' && ins.parsed?.info.source) {
          accountsToSubscribe.forEach((acc) => {
            if (ins.parsed.info.source === acc.address) {
              tx_with_transfer = tx
              info = ins.parsed.info
              account_from = acc.id
            }
          })
        }
      })
    }
  })

  if (tx_with_transfer && info) {
    const { preBalances, postBalances } = tx_with_transfer.meta
    const { lamports, destination } = info
    const { isNewWallet } = getTransactionMatchingLimport(
      preBalances,
      postBalances,
      lamports
    )
    if (!isNewWallet) return
    const solAmount = lamports / 1000000000
    if (solAmount < 0.5) return

    try {
      await axios.post('http://app:3000/api/wallets', {
        address: destination,
        exchangeId: account_from,
        initialBalance: solAmount,
        // timestamp: Date.now(),
      })
    } catch (error) {
      console.error('[ERROR] Failed to save wallet:', error.message)
    }

    // getting the wallet id  the amount and save it to the database with  timestamp
  }
}
