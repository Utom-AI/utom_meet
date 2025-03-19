import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def test_openai():
    try:
        # Test the OpenAI API
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Hello, how are you?"}
            ]
        )
        print("OpenAI Test Response:", response.choices[0].message.content)
        return True
    except Exception as e:
        print("OpenAI Test Error:", str(e))
        return False

if __name__ == "__main__":
    test_openai() 