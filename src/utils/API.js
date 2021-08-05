const API_KEY = process.env.REACT_APP_API_KEY || 'demo';
const URI = 'https://www.alphavantage.co/query';

const SEARCH_URI = `${URI}?function=SYMBOL_SEARCH&apikey=${encodeURIComponent(API_KEY)}&keywords=`;
const DETAILS_URI= `${URI}?function=OVERVIEW&apikey=${encodeURIComponent(API_KEY)}&symbol=`;
const TIMESERIES_URI = `${URI}?function=TIME_SERIES_INTRADAY&interval=5min&apikey=${API_KEY}&symbol=`;

async function makeGetRequest(url, apiName) {
  const result = await fetch(url);
  if(!result.ok) {
    throw new Error(`${apiName}_ERROR`);
  }
  return await result.json();
}

async function search(input) {
  return makeGetRequest(SEARCH_URI + encodeURIComponent(input), 'SEARCH');
}

function getDetails(symbol) {
  return makeGetRequest(DETAILS_URI + encodeURIComponent(symbol), 'DETAILS');
}

function getPriceData(symbol) {
  return makeGetRequest(TIMESERIES_URI + encodeURIComponent(symbol), 'PRICE_DATA')
    .then(data => ({
      metadata: data['Meta Data'],
      dataPoints: data['Time Series (5min)']
    }));
}

export {
  search,
  getDetails,
  getPriceData
};
