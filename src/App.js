import './App.css';
import { ContentContext } from './utils/content';
import { useEffect, useState } from 'react';
import SearchPage from './pages/search-page';

function App() {
  const [loading, setLoading] = useState(true);
  const [loadError, setError] = useState(false);
  const [content, setContent] = useState({});

  // Load the language pack.
  useEffect(() => {
    (async () => {
      const resp = await fetch('/content/en-US/content.json');
      if(!resp.ok) {
        // Error. Display error now.
        return setError(false);
      }

      setContent(await resp.json());
      setLoading(false);
    })();
  }, []);

  if(loading) {
    return (
      <div className="fullpage-overlay">
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if(loadError) {
    return (
      <div className="fullpage-overlay">
        <h1>Uh oh! Something went wrong.</h1>
        <h3>Please refresh the page to continue.</h3>
      </div>
    )
  }

  return (
    <div className="App">
      <ContentContext.Provider value={content}>
        <SearchPage />
      </ContentContext.Provider>
    </div>
  );
}

export default App;
