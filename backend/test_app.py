from flask import Flask, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
CORS(app)

# Initialize OpenAI client
openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({"message": "API is working"})

@app.route('/api/test-openai', methods=['GET'])
def test_openai():
    try:
        print("Testing OpenAI connection...")
        completion = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": "Say hello"}
            ]
        )
        return jsonify({"response": completion.choices[0].message.content})
    except Exception as e:
        print(f"OpenAI Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting test server...")
    app.run(host='0.0.0.0', port=8000, debug=True, use_reloader=False) 