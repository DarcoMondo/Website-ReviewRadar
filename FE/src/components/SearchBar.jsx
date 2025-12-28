import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';
import axios from 'axios';

const SearchBar = ({ onBusinessSelect, onLoading, onError }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchTimeoutRef = useRef(null);
  const latestQueryRef = useRef('');
  const searchContainerRef = useRef(null);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      return;
    }

    latestQueryRef.current = query;

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      searchBusinesses(query);
    }, 200);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query]);

  // Gestione click fuori dall'area dei suggerimenti
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const searchBusinesses = async (searchTerm) => {
    try {
      const response = await axios.get(`/api/place/search?query=${encodeURIComponent(searchTerm)}`);
      // Ignora risposte obsolete
      if (latestQueryRef.current !== searchTerm) return;

      if (response.data.results) {
        setSuggestions(response.data.results.slice(0, 5));
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleBusinessSelect = async (business) => {
    try {
      // Chiudi immediatamente i suggerimenti
      setShowSuggestions(false);
      setSuggestions([]);
      setSelectedIndex(-1);
      onLoading(true);
      setQuery(business.name);

      const response = await axios.get(`/api/place/details?place_id=${business.place_id}`);
      if (response.data.result) {
        onBusinessSelect(response.data.result);
      } else {
        throw new Error('No business details found');
      }
    } catch (error) {
      console.error('Business details error:', error);
      onError('Failed to load business details. Please try again.');
    } finally {
      onLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleBusinessSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        // Do nothing for other keys
        break;
    }
  };

  return (
    <div className="row justify-content-center mb-4">
      <div className="col-lg-6 col-md-8">
        <div className="position-relative" ref={searchContainerRef}>
          <div className="input-group input-group-lg shadow-sm">
            <span className="input-group-text bg-white border-end-0">
              <Search size={20} className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search for a business..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoFocus
            />
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="position-absolute w-100 mt-1 bg-white border rounded-3 shadow-lg" style={{ zIndex: 1000, maxHeight: '400px', overflowY: 'auto' }}>
              {suggestions.map((business, index) => (
                <div
                  key={business.place_id}
                  className={`p-3 border-bottom ${index === selectedIndex ? 'bg-primary text-white' : 'hover-bg-light'}`}
                  onClick={() => handleBusinessSelect(business)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-start">
                    <div className="me-3 mt-1">
                      <MapPin size={16} className={index === selectedIndex ? 'text-white' : 'text-muted'} />
                    </div>
                    <div className="flex-grow-1">
                      <div className={`fw-semibold text-truncate ${index === selectedIndex ? 'text-white' : ''}`}>
                        {business.name}
                      </div>
                      <div className={`small text-truncate ${index === selectedIndex ? 'text-white-50' : 'text-muted'}`}>
                        {business.formatted_address}
                      </div>
                      {business.rating && (
                        <div className={`small ${index === selectedIndex ? 'text-white-50' : 'text-success'}`}>
                          ⭐ {business.rating} ({business.user_ratings_total || 0} reviews)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;