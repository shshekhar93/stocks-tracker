function searchResultMapper(resultItem, symbolWidth) {
  let symbol = resultItem["1. symbol"];
  const name = resultItem["2. name"];

  return (
    <>
      <p className="ticker-symbol" style={{ width: symbolWidth }}>{symbol}</p>
      <p className="company-name">{name}</p>
    </>
  )
}

function getFormatter(currencyCode) {
  if(!currencyCode) {
    return new Intl.NumberFormat();
  }

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode
  });
}

function renderChart(elemId, data) {
  data = Object.keys(data).map(key => [new Date(key).getTime(), +data[key]['4. close']])
  window.Highcharts.chart(elemId, {
    chart: {
      zoomType: 'x'
    },
    title: {
      text: ''
    },
    xAxis: {
      type: 'datetime'
    },
    yAxis: {
      title: {
        text: 'Stock price'
      }
    },
    legend: {
      enabled: false
    },
    series: [{
      data
    }]
  });
}

export {
  searchResultMapper,
  getFormatter,
  renderChart
};
