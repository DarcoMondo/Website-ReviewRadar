from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY environment variable is required")

HUGGINGFACE_API_KEY = os.getenv('HUGGINGFACE_API_KEY')
if not HUGGINGFACE_API_KEY:
    raise ValueError("HUGGINGFACE_API_KEY environment variable is required")

GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place'
HUGGINGFACE_API_URL = 'https://router.huggingface.co/v1/chat/completions'
HUGGINGFACE_GPT2_URL = 'https://router.huggingface.co/v1/chat/completions'

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Server is running'})

@app.route('/api/place/details', methods=['GET'])
def get_place_details():
    """Get place details by place_id"""
    place_id = request.args.get('place_id')
    
    if not place_id:
        return jsonify({'error': 'place_id is required'}), 400
    
    try:
        url = f"{GOOGLE_PLACES_BASE_URL}/details/json"
        params = {
            'place_id': place_id,
            'key': GOOGLE_API_KEY,
            'fields': 'place_id,name,formatted_address,geometry,rating,reviews,photos,types,business_status',
            'language': 'en',
            'reviews_no_translations': 'true'
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        data = response.json()
        
        if data.get('status') == 'REQUEST_DENIED':
            return jsonify({'error': 'API key invalid or request denied'}), 400
        
        if data.get('status') != 'OK':
            return jsonify({'error': f"Google API error: {data.get('status')}"}), 400
        
        return jsonify(data)
        
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Request failed: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/place/search', methods=['GET'])
def search_places():
    """Search places by text"""
    query = request.args.get('query')
    
    if not query:
        return jsonify({'error': 'query parameter is required'}), 400
    
    try:
        url = f"{GOOGLE_PLACES_BASE_URL}/textsearch/json"
        params = {
            'query': query,
            'key': GOOGLE_API_KEY,
            'type': 'establishment',
            'language': 'en'
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        data = response.json()
        
        if data.get('status') == 'REQUEST_DENIED':
            return jsonify({'error': 'API key invalid or request denied'}), 400
        
        if data.get('status') != 'OK':
            return jsonify({'error': f"Google API error: {data.get('status')}"}), 400
        
        return jsonify(data)
        
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Request failed: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/generate-response', methods=['POST'])
def generate_response():
    """Generate AI response to a review"""
    data = request.get_json()
    
    if not data or 'review_text' not in data or 'business_name' not in data:
        return jsonify({'error': 'review_text and business_name are required'}), 400
    
    review_text = data['review_text']
    business_name = data['business_name']
    
    try:
        # Prepare the prompt for the AI
        prompt = f"""You are a helpful business owner responding to a customer review. 
        
Business: {business_name}
Customer Review: "{review_text}"

Please provide a professional, friendly, and helpful response to this review. 
The response should be:
- Professional and courteous
- Address any concerns mentioned
- Thank the customer for their feedback
- Keep it concise (2-3 sentences)
- Written in the same language as the review

Response:"""
        
        # Call Hugging Face API
        headers = {
            'Authorization': f'Bearer {HUGGINGFACE_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'messages': [
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            'model': 'openai/gpt-oss-120b:cerebras',
            'stream': False
        }
        
        response = requests.post(HUGGINGFACE_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        
        data = response.json()
        
        if 'choices' in data and len(data['choices']) > 0:
            ai_response = data['choices'][0]['message']['content']
            return jsonify({
                'response': ai_response,
                'status': 'success'
            })
        else:
            return jsonify({'error': 'No response generated from AI'}), 500
            
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'AI API request failed: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/analyze-sentiment', methods=['POST'])
def analyze_sentiment():
    """Analyze sentiment of a review text using the same model as generate-response"""
    data = request.get_json()
    
    if not data or 'text' not in data:
        return jsonify({'error': 'text is required'}), 400
    
    text = data['text']
    
    try:
        # Use the same API endpoint and model as generate-response
        prompt = f"""Analyze the sentiment of the following review text and determine if it is Positive, Neutral, or Negative.

Review text: "{text}"

Please analyze the sentiment and respond with ONLY one of these three words: "Positive", "Neutral", or "Negative".

Sentiment:"""
        
        headers = {
            'Authorization': f'Bearer {HUGGINGFACE_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'messages': [
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            'model': 'openai/gpt-oss-120b:cerebras',
            'stream': False
        }
        
        app.logger.info(f'Sending sentiment analysis request for text: {text[:50]}...')
        response = requests.post(HUGGINGFACE_API_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        
        api_data = response.json()
        app.logger.info(f'HuggingFace API response: {str(api_data)[:200]}')
        
        if 'choices' in api_data and len(api_data['choices']) > 0:
            sentiment_result = api_data['choices'][0]['message']['content'].strip()
            app.logger.info(f'Raw sentiment result: {sentiment_result}')
            
            # Parse the sentiment result
            sentiment_result_lower = sentiment_result.lower()
            
            if 'positive' in sentiment_result_lower:
                sentiment_label = "Positive"
                sentiment_color = "green"
                sentiment_score = 4.5  # High positive score
            elif 'negative' in sentiment_result_lower:
                sentiment_label = "Negative"
                sentiment_color = "red"
                sentiment_score = 2.0  # Low negative score
            elif 'neutral' in sentiment_result_lower:
                sentiment_label = "Neutral"
                sentiment_color = "orange"
                sentiment_score = 3.0  # Neutral score
            else:
                # Default to neutral if we can't determine
                app.logger.warning(f'Could not parse sentiment from result: {sentiment_result}, defaulting to Neutral')
                sentiment_label = "Neutral"
                sentiment_color = "orange"
                sentiment_score = 3.0
            
            result = {
                'sentiment_score': sentiment_score,
                'sentiment_label': sentiment_label,
                'sentiment_color': sentiment_color,
                'confidence': 0.85,  # High confidence for AI model
                'status': 'success'
            }
            app.logger.info(f'Sentiment analysis result: {result}')
            return jsonify(result)
        else:
            app.logger.error(f'No choices in API response: {api_data}')
            return jsonify({'error': 'No sentiment analysis result from AI'}), 500
            
    except requests.exceptions.Timeout:
        app.logger.error('Sentiment analysis request timed out')
        return jsonify({'error': 'Sentiment analysis request timed out. Please try again.'}), 504
    except requests.exceptions.RequestException as e:
        app.logger.error(f'Sentiment API request exception: {str(e)}')
        return jsonify({'error': f'Sentiment API request failed: {str(e)}'}), 500
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        app.logger.error(f'Unexpected error in sentiment analysis: {str(e)}\n{error_trace}')
        return jsonify({
            'error': f'Server error: {str(e)}',
            'traceback': error_trace if app.debug else None
        }), 500

@app.route('/api/predict-rating', methods=['POST'])
def predict_rating():
    """Predict next rating using GPT-2"""
    data = request.get_json()
    
    if not data or 'ratings' not in data:
        return jsonify({'error': 'ratings array is required'}), 400
    
    ratings = data['ratings']
    
    if not isinstance(ratings, list) or len(ratings) < 3:
        return jsonify({'error': 'At least 3 ratings are required for prediction'}), 400
    
    try:
        # Create prompt for GPT-OSS
        ratings_str = ', '.join(map(str, ratings))
        prompt = f"""You are an AI expert at predicting patterns in rating sequences.

Given this sequence of restaurant ratings: [{ratings_str}]

Please predict the next rating in the sequence. Consider:
- The overall trend of the ratings
- Any patterns you notice
- The typical range for restaurant ratings (1-5 stars)

Respond with ONLY a single number between 1 and 5, representing your prediction for the next rating.

Prediction:"""

        headers = {
            'Authorization': f'Bearer {HUGGINGFACE_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'messages': [
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            'model': 'openai/gpt-oss-120b:cerebras',
            'stream': False
        }
        
        response = requests.post(HUGGINGFACE_GPT2_URL, headers=headers, json=payload)
        response.raise_for_status()
        
        data = response.json()
        
        # Extract prediction from GPT-OSS response
        if 'choices' in data and len(data['choices']) > 0:
            generated_text = data['choices'][0]['message']['content']
            
            # Try to extract a number from the generated text
            import re
            numbers = re.findall(r'\d+', generated_text)
            
            if numbers:
                predicted_rating = int(numbers[0])
                # Ensure rating is between 1-5
                predicted_rating = max(1, min(5, predicted_rating))
            else:
                # Fallback: calculate average of recent ratings
                predicted_rating = round(sum(ratings[-3:]) / 3)
            
            # Calculate confidence and trend for additional info
            trend = 0
            if len(ratings) >= 2:
                trend = ratings[-1] - ratings[0]
            
            variance = sum((r - sum(ratings)/len(ratings))**2 for r in ratings) / len(ratings)
            confidence = max(0.3, min(0.9, 1 - variance/4))
            
            return jsonify({
                'predicted_rating': predicted_rating,
                'confidence': round(confidence, 2),
                'trend': 'improving' if trend > 0 else 'declining' if trend < 0 else 'stable',
                'status': 'success'
            })
        else:
            return jsonify({'error': 'No prediction generated'}), 500
            
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Prediction API request failed: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
