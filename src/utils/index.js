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

export {
  searchResultMapper,
  getFormatter
};
