import React from 'react';
import { TrendingUp, TrendingDown, Minus, Star } from 'lucide-react';

const PredictionCard = ({ prediction }) => {
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp size={20} className="text-success" />;
      case 'declining':
        return <TrendingDown size={20} className="text-danger" />;
      default:
        return <Minus size={20} className="text-muted" />;
    }
  };

  const getTrendText = (trend) => {
    switch (trend) {
      case 'improving':
        return 'Improving';
      case 'declining':
        return 'Declining';
      default:
        return 'Stable';
    }
  };

  const getTrendBadgeClass = (trend) => {
    switch (trend) {
      case 'improving':
        return 'bg-success text-white';
      case 'declining':
        return 'bg-danger text-white';
      default:
        return 'bg-warning text-dark';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.7) return 'success';
    if (confidence >= 0.4) return 'warning';
    return 'danger';
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.7) return 'High';
    if (confidence >= 0.4) return 'Medium';
    return 'Low';
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="card-title mb-0">Next Rating Prediction</h5>
          <div className="d-flex align-items-center">
            {getTrendIcon(prediction.trend)}
            <span className={`badge ${getTrendBadgeClass(prediction.trend)} ms-2`}>
              {getTrendText(prediction.trend)}
            </span>
          </div>
        </div>

        <div className="row align-items-center mb-4">
          <div className="col-md-6">
            <div className="text-center">
              <div className="d-flex justify-content-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={24}
                    className={i < prediction.predicted_rating ? 'text-warning' : 'text-muted'}
                  />
                ))}
              </div>
              <div className="display-6 fw-bold text-primary">
                {prediction.predicted_rating.toFixed(1)}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-semibold">Confidence:</span>
                <span className={`badge bg-${getConfidenceColor(prediction.confidence)}`}>
                  {getConfidenceText(prediction.confidence)}
                </span>
              </div>
              <div className="progress" style={{ height: '8px' }}>
                <div 
                  className={`progress-bar bg-${getConfidenceColor(prediction.confidence)}`}
                  style={{ width: `${prediction.confidence * 100}%` }}
                  role="progressbar"
                  aria-valuenow={prediction.confidence * 100}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-light p-3 rounded">
          <p className="mb-2">
            Based on the current trend, the next rating is expected to be{' '}
            <strong className="text-primary">{prediction.predicted_rating.toFixed(1)} stars</strong>.
          </p>
          <p className="mb-0">
            The trend is <strong className={`text-${prediction.trend === 'improving' ? 'success' : prediction.trend === 'declining' ? 'danger' : 'warning'}`}>
              {getTrendText(prediction.trend).toLowerCase()}
            </strong>, 
            with <strong className={`text-${getConfidenceColor(prediction.confidence)}`}>
              {getConfidenceText(prediction.confidence).toLowerCase()}
            </strong> confidence.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;
