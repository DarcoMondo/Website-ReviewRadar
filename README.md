# 🏪 Business Review AI

A full-stack web application for searching places, reading reviews, and getting AI-powered insights.

## 🚀 Features

- **🔍 Place Search**: Search for restaurants, shops, hotels using Google Places API
- **📝 Review Display**: View detailed reviews with ratings and photos
- **🤖 AI Responses**: Generate AI-powered responses to customer reviews
- **📊 Sentiment Analysis**: Analyze the sentiment of each review
- **📈 Rating Analytics**: Visualize rating trends with interactive charts
- **🔮 AI Predictions**: Predict future ratings using advanced AI models
- **💬 Autocomplete**: Smart search suggestions as you type

## 🛠️ Tech Stack

- **Backend**: Python Flask, Google Places API, Hugging Face AI
- **Frontend**: React 18, JavaScript, Recharts, Lucide React
- **Deployment**: Docker & Docker Compose

## 🚀 Quick Start

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd Website-ReviewAI
   cp env.example .env
   ```

2. **Add API keys to `.env`**
   ```
   GOOGLE_API_KEY=your_google_places_api_key_here
   HUGGINGFACE_API_KEY=your_huggingface_api_key_here
   ```

3. **Start the application**
   ```bash
   chmod +x entrypoint.sh
   ./entrypoint.sh
   ```

4. **Access**: http://localhost:3000

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild
docker-compose build && docker-compose up -d
```

## 🎯 Usage

1. **Search for a place** using the search bar
2. **Select a place** from the results
3. **View reviews** and ratings
4. **Use AI features**:
   - 🤖 Generate AI Response
   - 📊 Analyze Sentiment
   - 🔮 Predict Next Rating
5. **View analytics** with interactive charts

## 🔑 API Keys

- **Google Places API**: [Google Cloud Console](https://console.cloud.google.com/)
- **Hugging Face API**: [Hugging Face Tokens](https://huggingface.co/settings/tokens)
