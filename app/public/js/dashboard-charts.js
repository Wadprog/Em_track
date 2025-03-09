document.addEventListener('DOMContentLoaded', function () {
  const tokenData = document.getElementById('tokenData')
  if (!tokenData) {
    console.error('Token data element not found')
    return
  }

  try {
    const tokens = JSON.parse(decodeURIComponent(tokenData.dataset.tokens))

    tokens.forEach((token, index) => {
      const chartCanvas = document.getElementById(`priceChart${index}`)
      if (!chartCanvas) {
        console.error(`Chart canvas ${index} not found`)
        return
      }

      // Set explicit dimensions for the canvas
      chartCanvas.style.width = '100%'
      chartCanvas.style.height = '20px'

      const ctx = chartCanvas.getContext('2d')
      const prices = token.priceIndexes.map((pi) => pi.amount)

      if (!prices.length) {
        console.error(`No price data for token ${index}`)
        return
      }

      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: Array(prices.length).fill(''),
          datasets: [
            {
              data: prices,
              borderColor: '#007bff',
              borderWidth: 2,
              fill: false,
              pointRadius: 0,
              tension: 0.4, // Add some curve to the line
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              enabled: false,
            },
          },
          scales: {
            x: {
              display: false,
              grid: {
                display: false,
              },
            },
            y: {
              display: false,
              beginAtZero: true,
              grid: {
                display: false,
              },
            },
          },
          animation: {
            duration: 750, // Add animation
          },
        },
      })
      console.log('Charts created')
      console.log(chart)
    })
  } catch (error) {
    console.error('Error creating charts:', error)
  }
})
