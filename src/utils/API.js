const API_KEY = process.env.REACT_APP_API_KEY || 'demo';
const URI = 'https://www.alphavantage.co/query';

const SEARCH_URI = `${URI}?function=SYMBOL_SEARCH&apikey=${encodeURIComponent(API_KEY)}&keywords=`;

async function search(input) {
  const result = await fetch(SEARCH_URI + encodeURIComponent(input));
  if(!result.ok) {
    throw new Error('SEARCH_FAILED');
  }
  return await result.json();
}

function stringify(obj) {
  return Object.keys(obj).reduce((all, key) => 
    [...all, `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`], [])
    .join('&');
}

export {
  search
};
