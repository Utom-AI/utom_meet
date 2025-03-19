import os
from dotenv import load_dotenv, find_dotenv

# Load environment variables from .env file
env_path = find_dotenv()
print(f"Loading .env from: {env_path}")
if load_dotenv(env_path):
    print("Found .env file")
    print("Raw .env contents:")
    with open(env_path, 'r') as f:
        print(f.read())
else:
    print("No .env file found")

class Config:
    # Daily.co API configuration
    DAILY_API_KEY = os.getenv("DAILY_API_KEY")
    DAILY_API_URL = "https://api.daily.co/v1"
    
    # Print debug information about environment variables
    print("Environment Variables Debug:")
    print(f"Raw DAILY_API_KEY: {DAILY_API_KEY}")
    print(f"DAILY_API_KEY length: {len(DAILY_API_KEY) if DAILY_API_KEY else 0}")
    print(f"Current working directory: {os.getcwd()}")
    print("-" * 50)
    
    # Print API configuration debug information
    print("API Configuration Debug:")
    print(f"API URL: {DAILY_API_URL}")
    print(f"API Key length: {len(DAILY_API_KEY) if DAILY_API_KEY else 0}")
    print("-" * 50)
    
    # CORS configuration
    CORS_ORIGIN = os.getenv("CORS_ORIGIN", "http://localhost:3000")
    
    # Email configuration
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "True").lower() == "true"
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_DEFAULT_SENDER") 