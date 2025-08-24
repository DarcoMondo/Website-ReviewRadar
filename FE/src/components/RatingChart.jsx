import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Star } from 'lucide-react';

const RatingChart = ({ reviews }) => {
  const chartData = useMemo(() => {
    if (!reviews || reviews.length === 0) return [];

    // Sort reviews by date and group by day
    const sortedReviews = reviews
      .sort((a, b) => new Date(a.time) - new Date(b.time))
      .map(review => ({
        ...review,
        date: new Date(review.time).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        timestamp: new Date(review.time).getTime()
      }));

    // Group by date and calculate average rating per day
    const groupedData = sortedReviews.reduce((acc, review) => {
      const date = review.date;
      if (!acc[date]) {
        acc[date] = {
          date,
          ratings: [],
          averageRating: 0,
          count: 0
        };
      }
      acc[date].ratings.push(review.rating);
      acc[date].count++;
      acc[date].averageRating = acc[date].ratings.reduce((sum, r) => sum + r, 0) / acc[date].ratings.length;
      return acc;
    }, {});

    return Object.values(groupedData).map(day => ({
      date: day.date,
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
