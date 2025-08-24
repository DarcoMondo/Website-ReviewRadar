import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, MessageCircle } from 'lucide-react';
import axios from 'axios';
import RatingChart from './RatingChart';
import ReviewList from './ReviewList';
import PredictionCard from './PredictionCard';

const BusinessDetails = ({ business, onLoading, onError }) => {
  const [reviews, setReviews] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (business && business.reviews) {
      setReviews(business.reviews);
      generatePrediction();
    }
  }, [business]);

  const generatePrediction = async () => {
    try {
      if (!business.reviews || business.reviews.length < 3) {
        return;
      }

      const ratings = business.reviews
        .sort((a, b) => new Date(a.time) - new Date(b.time))
        .map(review => review.rating);

      const response = await axios.post('/api/predict-rating', {
        ratings: ratings
      });

      if (response.data.status === 'success') {
        setPrediction(response.data);
      }
    } catch (error) {
      console.error('Prediction error:', error);
      // Don't show error for prediction as it's not critical
    }
  };

  const getAverageRating = () => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      distribution[review.rating]++;
    });
    return distribution;
  };

  return (
    <div className="business-details">
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h2 className="card-title mb-2">{business.name}</h2>
              <p className="text-muted mb-3">{business.formatted_address}</p>
              <div className="d-flex align-items-center">
                <div className="d-flex me-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < Math.floor(business.rating) ? 'text-warning' : 'text-muted'}
                    />
                  ))}
                </div>
                <span className="text-muted">
                  {business.rating} ({business.user_ratings_total || reviews.length} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white border-0">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <TrendingUp size={16} className="me-2" />
                Overview
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                <MessageCircle size={16} className="me-2" />
                Reviews ({reviews.length})
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body">
          {activeTab === 'overview' && (
            <div className="overview-content">
              <div className="row g-4 mb-4">
                <div className="col-md-4">
                  <div className="card bg-primary text-white text-center">
                    <div className="card-body">
                      <div className="display-6 fw-bold">{getAverageRating()}</div>
                      <div className="small">Average Rating</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card bg-success text-white text-center">
                    <div className="card-body">
                      <div className="display-6 fw-bold">{reviews.length}</div>
                      <div className="small">Total Reviews</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card bg-info text-white text-center">
                    <div className="card-body">
                      <div className="display-6 fw-bold">
                        {reviews.filter(r => r.rating >= 4).length}
                      </div>
                      <div className="small">Positive Reviews</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="card-title mb-0">Rating Trends</h5>
                </div>
                <div className="card-body">
                  <RatingChart reviews={reviews} />
                </div>
              </div>

              {prediction && (
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title mb-0">Rating Prediction</h5>
                  </div>
                  <div className="card-body">
                    <PredictionCard prediction={prediction} />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-content">
              <ReviewList 
                reviews={reviews} 
                businessName={business.name}
                onError={onError}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessDetails;
