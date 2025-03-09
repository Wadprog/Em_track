import axios from 'axios'
import getTime from "date-fns/getTime"
import  subMinutes from "date-fns/subMinutes";

const api_base_url = 'https://api.jup.ag/price/v2'

const checkPrice = async (tokenId) => {
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

const CORRECT_MEG = 'Program log: initialize2: InitializeInstruction2'
const crL = 'srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX invoke'


const SI_SYMBOL = ["", "k", "M", "G", "T", "P", "E"];

function abbreviateNumber(number) {
   var tier = (Math.log10(Math.abs(number)) / 3) | 0;
   if (tier == 0) return number.toString();
   var suffix = SI_SYMBOL[tier];
   var scale = Math.pow(10, tier * 3);
   var scaled = number / scale;
   return scaled.toFixed(1) + suffix;
}


  
    


const parser = (data) => {
  
  if(!data?.params?.result?.value) return;
  data?.params?.result?.value?.block?.transactions

  let has_prg = false
  let has_srmq = false
  let correctTransaction = null

  data?.params?.result?.value?.block?.transactions.forEach((tx) => {
    tx.meta?.logMessages?.forEach((log) => {
      if (log.includes(CORRECT_MEG)) has_prg = true

      if (log.includes(crL)) has_srmq = true
    })

    if (has_prg && has_srmq) {
      correctTransaction = tx
    }
  })

  if (correctTransaction) {
    correctTransaction.meta.preTokenBalances.map(
      async ({ accountIndex, mint }) => {
        if (accountIndex !== 9)
          return

          let tokenExisted = null
          
          try{
            tokenExisted=(await axios.get('http://em_api:3000/tokens?mint=' + mint)).data[0]
          }catch(e){
            console.log('Token does not exist',e.message)
          }
          console.log({tokenExisted})

          if (tokenExisted) {
            axios.put('http://em_api:3000/tokens/' + tokenExisted.id, {
              status: 'migrated',
              migrated_at: new Date(),
              updated_at: subMinutes(new Date(), 5)
            })
            return
          }
          else 
          {
          await axios.post('http://em_api:3000/tokens', {
            mint,
            tag:'migration',
            updated_at: subMinutes(new Date(), 5)
          })
        
          // // initial price check . . . 
          // const initPrice = await checkPrice(mint)
          // const price = initPrice.data[mint]?.price
          //   if (!price) {
          //     console.log(`No price found for ${mint}} altering time`)

          //     const pass_5_min = getTime(subMinutes(new Date() , 5))

          //     console.log({pass_5_min})
          //    await axios.patch(`http://em_api:3000/tokens/${tok.data.id}`,{
          //     updated_at: pass_5_min
          //    })
          //    console.log('No price found , reverse time')

          //     return
          //   }
          //   await axios.post('http://em_api:3000/index_price', {
          //     token_id: tok.data.id,
          //     price,
          //     market_cap: abbreviateNumber(price * 1_000_000_000) ||0 ,
          //     time: new Intl.DateTimeFormat('en-US', {
          //       dateStyle: 'full',
          //       timeStyle: 'long',
          //     }).format(new Date()),
          //   })
           
        }





      }
    )
  }
}
export default parser

// axios.get('http://em_api:3000/quick').then((res) => {
//   parser(res.data[0])
// })
