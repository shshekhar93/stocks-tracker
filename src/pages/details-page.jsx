import React, { useEffect, useMemo, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useParams } from 'react-router';
import SearchField from '../components/search-field';
import { getFormatter, renderChart } from '../utils';
import { getDetails, getPriceData, search } from '../utils/API';
import { ContentKeys } from '../utils/constants';
import { useContent } from '../utils/content';

import './details-page.css';

function DetailsPage() {
  const {id} = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overview, setOverview] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const getContent = useContent();

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      setOverview(null);
      setPriceData(null);
      const [
        overview,
        priceData
      ] = await Promise.all([
        getDetails(id).catch(() => null),
        getPriceData(id).catch(() => null)
      ]);

      if(!overview || !priceData || !priceData.dataPoints) {
        // We have ourselves an error.
        setLoading(false);
        return setError('API_ERROR');
      }
      
      overview && setOverview(overview);
      priceData && setPriceData(priceData);
      priceData && setTimeout(() => renderChart('chart-container', priceData.dataPoints), 100);

      setLoading(false);
    })();
  }, [id]);

  const mCap = useMemo(() => {
    if(!overview || !overview.Currency) {
      return new Intl.NumberFormat().format(0.00);
    }
    const formatter = new Intl.NumberFormat(undefined, {style: 'currency', currency: overview.Currency});
    return formatter.format(overview.MarketCapitalization || 0);
  }, [overview]);

  const curPrice = useMemo(() => {
    if(!priceData || !priceData.dataPoints || priceData.dataPoints.length === 0) {
      return null;
    }

    const latestKey = Object.keys(priceData.dataPoints).pop();
    const latestPrice = priceData.dataPoints[latestKey]['4. close'];
    return getFormatter(overview && overview.Currency).format(latestPrice);
  }, [priceData, overview]);

  return (
    <div className="container details-page">
      <div className="d-flex">
        <p className="details-page-brandname">{getContent(ContentKeys.SEARCH_PAGE_TITLE)}</p>
        <SearchField
          defaultValue={id}
          compact={true}
          search={search}
          placeholder={getContent(ContentKeys.SEARCH_PLACEHOLDER)} />
      </div>
      <hr />
      {loading && <LoadingSkeletion />}
      {error && <p class="alert alert-danger" role="alert">Data not available. Please check the symbol.</p>}
      {!loading && overview && 
        <section role="main">
          <div className="details-page-title">
            <h1>{overview.Name}</h1>
            <h1>{curPrice}</h1>
          </div>
          <p>
            <span class="text-muted">{overview.Exchange}:</span> {overview.Symbol}
          </p>
          <div class="row">
            <div className="col-sm-12 col-md-6">
              <p>{overview.Description}</p>
            </div>
            <div className="col-12 col-md-1" />
            <div className="col-sm-12 col-md-5">
              <div className="overview-table">
                <div className="row">
                  <div className="overview-label col-4">PE Ratio</div>
                  <div className="overview-value col">{overview.PERatio}</div>
                </div>
                <div className="row">
                  <div className="overview-label col-4">Market cap</div>
                  <div className="overview-value col">{mCap}</div>
                </div>
                <div className="row">
                  <div className="overview-label col-4">Industry</div>
                  <div className="overview-value col" tooltip={overview.Industry}>{overview.Industry}</div>
                </div>
              </div>
            </div>
          </div>
          <div id="chart-container"></div>
        </section>
      }
    </div>
  );
}

function LoadingSkeletion() {
  return (
    <>
      <h1><Skeleton /></h1>
      <p style={{ width: '20%' }}><Skeleton /></p>
      <div className="row">
        <div className="col-6">
          <Skeleton count={5} />
        </div>
        <div className="col-1" />
        <div className="col-5">
          <Skeleton count={3} />
        </div>
      </div>
    </>
  );
}

export default DetailsPage;
