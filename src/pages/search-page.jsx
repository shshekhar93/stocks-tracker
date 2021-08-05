import React from 'react';
import SearchField from '../components/search-field';
import { search } from '../utils/API';
import { ContentKeys } from '../utils/constants';
import { useContent } from '../utils/content';

import './search-page.css';

function SearchPage() {
  const getContent = useContent();

  return (
    <div className="container search-page">
      <h1 className="page-title display-4">{getContent(ContentKeys.SEARCH_PAGE_TITLE)}</h1>
      <SearchField
        search={search}
        placeholder={getContent(ContentKeys.SEARCH_PLACEHOLDER)} />
    </div>
  );
}

export default SearchPage;
