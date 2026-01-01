import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Star } from 'lucide-react';

const RatingChart = ({ reviews }) => {
  const chartData = useMemo(() => {
    if (!reviews || reviews.length === 0) return [];

    // Sort reviews by date and group by day (full date: day/month/year)
    // Google Places API returns time in seconds, JavaScript Date expects milliseconds
    const sortedReviews = reviews
      .sort((a, b) => {
        const timeA = typeof a.time === 'number' ? a.time * 1000 : a.time;
        const timeB = typeof b.time === 'number' ? b.time * 1000 : b.time;
        return new Date(timeA) - new Date(timeB);
      })
      .map(review => {
        // Convert seconds to milliseconds
        const timestampMs = typeof review.time === 'number' ? review.time * 1000 : review.time;
        const reviewDate = new Date(timestampMs);
        // Create a unique key for each day (YYYY-MM-DD format for proper sorting)
        const dateKey = reviewDate.toISOString().split('T')[0];
        // Format for display: day/month
        const dateDisplay = reviewDate.toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short'
        });
        
        return {
          ...review,
          dateKey, // Used for grouping (ensures same day = same group)
          dateDisplay, // Used for display
          timestamp: reviewDate.getTime()
        };
      });

    // Group by full date (day/month/year) and calculate average rating per day
    const groupedData = sortedReviews.reduce((acc, review) => {
      const dateKey = review.dateKey;
      if (!acc[dateKey]) {
        acc[dateKey] = {
          dateKey,
          dateDisplay: review.dateDisplay,
          ratings: [],
          averageRating: 0,
          count: 0
        };
      }
      acc[dateKey].ratings.push(review.rating);
      acc[dateKey].count++;
      acc[dateKey].averageRating = acc[dateKey].ratings.reduce((sum, r) => sum + r, 0) / acc[dateKey].ratings.length;
      return acc;
    }, {});

    // Convert to array and sort by date key to ensure chronological order
    return Object.values(groupedData)
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
      .map(day => ({
        date: day.dateDisplay,
        rating: parseFloat(day.averageRating.toFixed(1)),
        count: day.count
      }));
  }, [reviews]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border rounded shadow p-3">
          <p className="fw-bold mb-1">{label}</p>
          <p className="text-primary mb-1">
            Rating: {payload[0].value} ⭐
          </p>
          <p className="text-muted small mb-0">
            Reviews: {payload[0].payload.count}
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="text-center py-5">
        <Star size={48} className="text-muted mb-3" />
        <p className="text-muted">No rating data available</p>
      </div>
    );
  }

  return (
    <div className="rating-chart">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            stroke="#666"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            domain={[0, 5]}
            stroke="#666"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}⭐`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="rating"
            stroke="#0d6efd"
            strokeWidth={3}
            dot={{ fill: '#0d6efd', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#0d6efd', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RatingChart;
