/**
 * This script is used to monitor the price of the tokens in the database
 * and update the price in the database every minute
 * The script fetches the price of the token from the Jup.ag API
 * Last Modified: 2024-11-30
 */

import axios from 'axios'
import differenceInHours from 'date-fns/differenceInHours'
import differenceInMinutes from 'date-fns/differenceInMinutes'


const intervalTime = 5000
const api_base_url = 'https://api.jup.ag/price/v2'
const max_monitor_time = 4 // hours
const update_time_interval = 5 // minutes



const fetchTokentPrice = async (tokenId) => {
  const request = {
    method: 'get',
    url: api_base_url,
    params: {
      showExtraInfo: true,
      ids: tokenId,
    },
  }
  const response = await axios(request)
  return response.data
}

const SI_SYMBOL = ["", "k", "M", "G", "T", "P", "E"];

function abbreviateNumber(number) {
   var tier = (Math.log10(Math.abs(number)) / 3) | 0;
   if (tier == 0) return number.toString();
   var suffix = SI_SYMBOL[tier];
   var scale = Math.pow(10, tier * 3);
   var scaled = number / scale;
   return scaled.toFixed(1) + suffix;
}


const run = async () => {
  const allPumpRayTokens = await axios.get(`http://em_api:3000/tokens`)
  for (let token of allPumpRayTokens.data) {
    if (differenceInHours(new Date(), new Date(token.timestamp)) > max_monitor_time) continue

    const lastCheck = differenceInMinutes(new Date(), new Date(token.updated_at||token.timestamp))
    if (lastCheck < update_time_interval) {
      console.log(`Skipping token last checked was ${lastCheck} minutes ago`)
      continue
    };

    try {
      const res = await fetchTokentPrice(token.mint)
      const price = res.data[token.mint]?.price
      if (!price) continue
     

      await axios.post('http://em_api:3000/index_price', {
        token_id: token.id,
        price,
        market_cap: abbreviateNumber(price* 1_000_000_000),
        time_stamp: Date.now(),
        human_readable_time: new Intl.DateTimeFormat('en-US', {
          dateStyle: 'full',
          timeStyle: 'long',
          timeZone: 'America/New_York',
        }).format(new Date()),
      })

      // upadate the token updated_at field
      await axios.patch(`http://em_api:3000/tokens/${token.id}`, {
        updated_at: new Date()
      })
    } catch (error) {
      console.log('Sumthing went wrong')
    }
  }
}

setInterval(run, intervalTime)
// run()
