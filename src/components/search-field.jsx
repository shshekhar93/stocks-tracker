import React, { useCallback, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { searchResultMapper } from '../utils';

import './search-field.css';
import './dropdown.css';

function SearchField({ defaultValue, placeholder, compact, search }) {
  const [ value, setValue ] = useState(() => (defaultValue || ''));
  const [ searchResults, setSearchResults ] = useState([]);
  const [ dropdownOpen, setDropdownOpen ] = useState(false);
  const [symbolWidth, setSymbolWidth] = useState('initial');
  const [idx, setIdx] = useState(-1);
  const dropdownRef = useRef(null);
  const timer = useRef(null);
  const latest = useRef(0);
  const classes = classnames({
    'stocks-tracker-search-field': true,
    compact
  });

  useEffect(() => {
    if(!dropdownRef.current) {
      return;
    }

    const maxWidth = Array.from(dropdownRef.current.children).reduce((maxWidth, elem) => {
      const symbol = elem.querySelector('.ticker-symbol');
      if(!symbol) {
        return maxWidth;
      }
      return Math.max(maxWidth, symbol.offsetWidth);
    }, 0);

    setSymbolWidth(maxWidth + 15);
  }, [ searchResults ]);

  useEffect(() => {
    if(idx === -1 || !searchResults[idx]) {
      return;
    }

    const symbol = searchResults[idx]['1. symbol'];
    setValue(symbol);
  }, [idx]);

  const openDropdown = useCallback(() => setDropdownOpen(true));
  const closeDropdown = useCallback(() => setDropdownOpen(false));

  const onChange = useCallback((e) => {
    setValue(e.target.value);

    // deboune
    if(timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(async () => {
      timer.current = null;
      const reqTime = Date.now();
      
      const { bestMatches } = await (search(e.target.value).catch(() => ({ bestMatches: [] })));
      if(latest.current < reqTime) {
        latest.current = reqTime;
        setSearchResults(bestMatches);
        setIdx(idx => idx >= bestMatches.length ? bestMatches.length - 1 : idx);
      }
    }, 300);
  }, [ search, idx ]);

  const onKeyDown = useCallback((e) => {
    switch(e.key) {
      case 'Esc':
      case 'Escape':
        closeDropdown();
        break;

      case "Down":
      case "ArrowDown":
        setIdx(idx => (idx + 1) % searchResults.length);
        e.preventDefault();
        break;

      case "Up":
      case "ArrowUp":
        setIdx(idx => idx === -1 ? searchResults.length - 1 : (idx - 1 + searchResults.length) % searchResults.length);
        e.preventDefault();
        break;
    }
  }, [
    closeDropdown,
    searchResults
  ]);

  return (
    <div className={classes}>
      <div className="input-container">
        <input
          className="form-control"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={openDropdown}
          onClick={openDropdown}
          onBlur={closeDropdown} />
        {!!value.length && dropdownOpen &&
          getDropdown(searchResults, symbolWidth, searchResultMapper, idx, dropdownRef)
        }
      </div>
      <div className="button-container">
        <button className="btn btn-primary">Search</button>
      </div>
    </div>
  );
}

function getDropdown(options, symbolWidth, mapper, idx, dropdownRef, onSelect) {

  if(!options.length) {
    return (
      <p className="suggestion-dropdown">No results found.</p>
    );
  }

  return (
    <ul className="suggestion-dropdown" ref={dropdownRef}>
      {
        options.map((item, i) => 
          <li key={i} className={classnames({ selected: i === idx })}>{
            mapper(item, symbolWidth)
          }</li>)
      }
      <li style={{ justifyContent: 'center' }}>
        <button className="btn btn-primary" style={{ margin: 0 }}>Search</button>
      </li>
    </ul>
  );
}

export default SearchField;

SearchField.propTypes = {
  defaultValue: PropTypes.string,
  placeholder:PropTypes.string,
  search: PropTypes.func,
  compact: PropTypes.bool
};
