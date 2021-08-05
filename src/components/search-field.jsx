import React, { useCallback, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router';
import classnames from 'classnames';
import { searchResultMapper } from '../utils';
import { ContentKeys } from '../utils/constants';
import { useContent } from '../utils/content';

import './search-field.css';
import './dropdown.css';

const DUMMY_RESP = { bestMatches: [] };

function SearchField({ defaultValue, placeholder, compact, search }) {
  const [ value, setValue ] = useState(() => (defaultValue || ''));
  const [ searchResults, setSearchResults ] = useState([]);
  const [ dropdownOpen, setDropdownOpen ] = useState(false);
  const [symbolWidth, setSymbolWidth] = useState('initial');
  const [idx, setIdx] = useState(-1);
  const dropdownRef = useRef(null);
  const timer = useRef(null);
  const latest = useRef(0);
  const getContent = useContent();
  const history = useHistory();


  const classes = classnames({
    'stocks-tracker-search-field': true,
    compact
  });

  useEffect(() => {
    if(defaultValue) {
      (async () => {
        setSearchResults((await search(defaultValue).catch(() => DUMMY_RESP)).bestMatches);
      })();
      
    }
  }, [])

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

    setSymbolWidth(maxWidth);
  }, [ searchResults, dropdownOpen ]);

  useEffect(() => {
    if(idx === -1 || !searchResults[idx]) {
      return;
    }

    const symbol = searchResults[idx]['1. symbol'];
    setValue(symbol);
  }, [idx]);

  const openDropdown = useCallback(() => setDropdownOpen(true), []);
  const closeDropdown = useCallback(() => setTimeout(() => setDropdownOpen(false), 250), []);

  const onChange = useCallback((e) => {
    const val = e.target.value;
    setValue(val);

    if(timer.current) {
      clearTimeout(timer.current);
    }

    if(val === '') {
      return setSearchResults([]);
    }

    // deboune
    timer.current = setTimeout(async () => {
      timer.current = null;
      const reqTime = Date.now();
      
      const { bestMatches } = await (search(val).catch(() => DUMMY_RESP));
      if(latest.current < reqTime) {
        latest.current = reqTime;
        setSearchResults(bestMatches);
        setIdx(idx => idx >= bestMatches.length ? bestMatches.length - 1 : idx);
      }
    }, 300);
  }, [ search, idx ]);

  const navigate = useCallback(() => {
    history.push(`/symbol/${value}`);
  }, [value]);

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
      case 'Enter':
        navigate();
        closeDropdown();
    }
  }, [
    closeDropdown,
    navigate,
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
          onBlur={closeDropdown}
          aria-haspopup="listbox"
          aria-expanded={!!value.length && dropdownOpen}
          aria-controls="suggestions-dropdown" />
        {!!value.length && dropdownOpen &&
          getDropdown(searchResults, symbolWidth, searchResultMapper, idx, dropdownRef, getContent, !compact, navigate)
        }
      </div>
      <div className="button-container">
        <button className="btn btn-primary" onClick={navigate}>{getContent(ContentKeys.SEARCH_LABEL)}</button>
      </div>
    </div>
  );
}

function getDropdown(options, symbolWidth, mapper, idx, dropdownRef, getContent, showButton, onClick) {
  if(!options.length) {
    return (
      <p id="suggestions-dropdown" className="suggestion-dropdown">{getContent(ContentKeys.NO_RESULTS)}</p>
    );
  }

  return (
    <ul id="suggestions-dropdown" className="suggestion-dropdown" ref={dropdownRef}>
      {
        options.map((item, i) => 
          <li key={i} className={classnames({ selected: i === idx })} onClick={onClick}>{
            mapper(item, symbolWidth)
          }</li>)
      }
      {showButton &&
        <li style={{ justifyContent: 'center' }}>
          <button className="btn btn-primary" style={{ margin: 0 }} tabIndex="-1">{getContent(ContentKeys.SEARCH_LABEL)}</button>
        </li>
      }
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
