import React, { useState } from 'react';
import { Star, MessageCircle, ThumbsUp, ThumbsDown, Minus, Brain } from 'lucide-react';
import axios from 'axios';

const ReviewList = ({ reviews, businessName, onError }) => {
  const [sentiments, setSentiments] = useState({});
  const [autoResponses, setAutoResponses] = useState({});
  const [loadingSentiments, setLoadingSentiments] = useState({});
  const [loadingResponses, setLoadingResponses] = useState({});

  const analyzeSentiment = async (review) => {
    const reviewKey = review.time;
    setLoadingSentiments(prev => ({ ...prev, [reviewKey]: true }));

    try {
      const response = await axios.post('/api/analyze-sentiment', {
        text: review.text
      });

      if (response.data.status === 'success') {
        setSentiments(prev => ({
          ...prev,
          [reviewKey]: response.data
        }));
      } else {
        const errorMsg = response.data.error || 'Unknown error occurred';
        onError(`Sentiment analysis failed: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error occurred';
      setSentiments(prev => ({
        ...prev,
        [reviewKey]: {
          sentiment_label: 'Error',
          sentiment_color: 'gray'
        }
      }));
      onError(`Failed to analyze sentiment: ${errorMessage}`);
    } finally {
      setLoadingSentiments(prev => ({ ...prev, [reviewKey]: false }));
    }
  };

  const generateAutoResponse = async (review) => {
    const reviewKey = review.time;
    setLoadingResponses(prev => ({ ...prev, [reviewKey]: true }));

    try {
      const response = await axios.post('/api/generate-response', {
        review_text: review.text,
        business_name: businessName
      });

      if (response.data.status === 'success') {
        setAutoResponses(prev => ({
          ...prev,
          [reviewKey]: response.data.response
        }));
      }
    } catch (error) {
      console.error('Auto response error:', error);
      onError('Failed to generate auto response. Please try again.');
    } finally {
      setLoadingResponses(prev => ({ ...prev, [reviewKey]: false }));
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'Positive':
        return <ThumbsUp size={16} className="text-success" />;
      case 'Negative':
        return <ThumbsDown size={16} className="text-danger" />;
      default:
        return <Minus size={16} className="text-muted" />;
    }
  };

  const getSentimentBadgeClass = (sentiment) => {
    switch (sentiment) {
      case 'Positive':
        return 'bg-success text-white';
      case 'Negative':
        return 'bg-danger text-white';
      case 'Neutral':
        return 'bg-warning text-dark';
      default:
        return 'bg-secondary text-white';
    }
  };

  const formatDate = (timestamp) => {
    // Google Places API returns time in seconds, JavaScript Date expects milliseconds
    const timestampMs = typeof timestamp === 'number' ? timestamp * 1000 : timestamp;
    return new Date(timestampMs).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const sortedReviews = reviews
    .sort((a, b) => {
      // Convert seconds to milliseconds for proper date comparison
      const timeA = typeof a.time === 'number' ? a.time * 1000 : a.time;
      const timeB = typeof b.time === 'number' ? b.time * 1000 : b.time;
      return new Date(timeB) - new Date(timeA);
    });

  return (
    <div className="review-list">
      <div className="mb-4">
        <h4 className="mb-2">Customer Reviews</h4>
        <p className="text-muted">Showing {reviews.length} reviews sorted by date</p>
      </div>

      {sortedReviews.map((review) => {
        const sentiment = sentiments[review.time];
        const autoResponse = autoResponses[review.time];
        const isLoadingSentiment = loadingSentiments[review.time];
        const isLoadingResponse = loadingResponses[review.time];

        return (
          <div key={review.time} className="card mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h6 className="card-subtitle mb-1 fw-semibold">
                    {review.author_name || 'Anonymous'}
                  </h6>
                  <small className="text-muted">{formatDate(review.time)}</small>
                </div>
                <div className="d-flex align-items-center">
                  <div className="d-flex me-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < review.rating ? 'text-warning' : 'text-muted'}
                      />
                    ))}
                  </div>
                  <span className="fw-semibold">{review.rating}</span>
                </div>
              </div>

              <p className="card-text mb-3">{review.text}</p>

              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  {isLoadingSentiment ? (
                    <div className="text-muted small">
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      Analyzing...
                    </div>
                  ) : sentiment ? (
                    <span className={`badge ${getSentimentBadgeClass(sentiment.sentiment_label)} d-flex align-items-center`}>
                      {getSentimentIcon(sentiment.sentiment_label)}
                      <span className="ms-1">{sentiment.sentiment_label}</span>
                    </span>
                  ) : (
                    <span className="badge bg-secondary text-white d-flex align-items-center">
                      <Minus size={16} />
                      <span className="ms-1">Not Analyzed</span>
                    </span>
                  )}
                </div>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-info btn-sm"
                    onClick={() => analyzeSentiment(review)}
                    disabled={isLoadingSentiment}
                  >
                    <Brain size={16} className="me-1" />
                    {isLoadingSentiment ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-1" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Sentiment'
                    )}
                  </button>

                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => generateAutoResponse(review)}
                    disabled={isLoadingResponse}
                  >
                    <MessageCircle size={16} className="me-1" />
                    {isLoadingResponse ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-1" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Generating...
                      </>
                    ) : (
                      'Generate Response'
                    )}
                  </button>
                </div>
              </div>

              {autoResponse && (
                <div className="mt-3 p-3 bg-light rounded">
                  <div className="d-flex align-items-center mb-2">
                    <MessageCircle size={16} className="text-primary me-2" />
                    <span className="fw-semibold text-primary">AI Generated Response</span>
                  </div>
                  <p className="mb-0">{autoResponse}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {reviews.length === 0 && (
        <div className="text-center py-5">
          <MessageCircle size={48} className="text-muted mb-3" />
          <p className="text-muted">No reviews available for this business</p>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
