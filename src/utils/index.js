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

export {
  searchResultMapper
};
