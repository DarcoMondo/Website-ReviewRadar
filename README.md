# ReviewRadar

## Introduction

ReviewRadar is a web application that helps businesses manage and analyze Google reviews using artificial intelligence. It automates review analysis, generates professional responses, and predicts rating trends to save time and improve customer engagement.

## Description

ReviewRadar connects to Google Places API to fetch business information and reviews. The application uses Hugging Face AI models to analyze sentiment, generate personalized responses, and predict future ratings based on historical data. Users can search for any business, view detailed analytics with interactive charts, and get AI-powered insights to better understand their online reputation.

Key features:
- Search businesses using Google Places API
- Analyze review sentiment automatically
- Generate AI-powered responses to reviews
- Visualize rating trends over time
- Predict future ratings based on historical patterns

## Technologies Used

**Backend:**
- Python (Flask)
- Google Places API
- Hugging Face Router API (AI models)

**Frontend:**
- React
- Bootstrap 5
- Recharts (data visualization)
- react-snap (SEO optimization)

**Infrastructure:**
- Docker & Docker Compose

<div align="left">
  <img src="docs/img/" alt="React" width="80" height="80"/>

</div>

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- Google Places API key
- Hugging Face API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Website-GoogleReviewAudit
```

2. Create a `.env` file in the root directory:
```
GOOGLE_API_KEY=your_google_places_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

3. Start the application:
```bash
docker-compose up -d
```

4. Access the application at `http://localhost:3000`

### API Keys

- **Google Places API**: Get your key from [Google Cloud Console](https://console.cloud.google.com/)
- **Hugging Face API**: Get your key from [Hugging Face Settings](https://huggingface.co/settings/tokens)

### Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose build && docker-compose up -d
```
