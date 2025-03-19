from typing import Dict, Any
import requests
from .config import Config

def make_daily_request(method: str, endpoint: str, data: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Make a request to the Daily.co API
    
    Args:
        method: HTTP method (GET, POST, etc.)
        endpoint: API endpoint
        data: Request data (for POST, PUT methods)
    
    Returns:
        API response as dictionary
    """
    headers = {
        "Authorization": f"Bearer {Config.DAILY_API_KEY}",
        "Content-Type": "application/json"
    }
    
    url = f"{Config.DAILY_API_URL}/{endpoint.lstrip('/')}"
    
    response = requests.request(
        method=method,
        url=url,
        headers=headers,
        json=data
    )
    response.raise_for_status()
    
    return response.json() 