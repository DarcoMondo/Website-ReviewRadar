import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import BusinessDetails from './components/BusinessDetails';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleBusinessSelect = (business) => {
    setSelectedBusiness(business);
    setError(null);
  };

  const handleLoading = (isLoading) => {
    setLoading(isLoading);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setLoading(false);
  };

  return (
    <div className="App">
      <header className="bg-primary text-white py-4 shadow">
        <div className="container">
          <div className="text-center">
            <h1 className="display-4 fw-bold mb-2">
              <span className="me-2">📊</span>
              Website Review AI
            </h1>
            <p className="lead opacity-75">Analyze and predict review trends</p>
          </div>
        </div>
      </header>

      <main className="py-5">
        <div className="container">
          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
              <span className="me-2">⚠️</span>
              {error}
            </div>
          )}

          <SearchBar 
            onBusinessSelect={handleBusinessSelect}
            onLoading={handleLoading}
            onError={handleError}
          />

          {loading && <LoadingSpinner />}

          {selectedBusiness && !loading && (
            <BusinessDetails 
              business={selectedBusiness}
              onLoading={handleLoading}
              onError={handleError}
            />
          )}

          {!selectedBusiness && !loading && (
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="card shadow-sm border-0">
                  <div className="card-body text-center p-5">
                    <h2 className="card-title mb-3">Welcome to Website Review AI</h2>
                    <p className="card-text text-muted mb-4">Search for a business to start analyzing reviews</p>
                    
                    <div className="row g-4">
                      <div className="col-md-4">
                        <div className="text-center p-3">
                          <div className="display-6 mb-3">🔍</div>
                          <h5>Business Search</h5>
                          <p className="text-muted small">Search any business on Google Business</p>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="text-center p-3">
                          <div className="display-6 mb-3">📈</div>
                          <h5>Trend Analysis</h5>
                          <p className="text-muted small">View charts and rating predictions</p>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="text-center p-3">
                          <div className="display-6 mb-3">💬</div>
                          <h5>Review Management</h5>
                          <p className="text-muted small">Analyze sentiment and generate auto-responses</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
