import requests
import json
import time
from typing import Dict, Any

BASE_URL = "http://localhost:8000"

def print_response(response: requests.Response):
    print(f"\nStatus Code: {response.status_code}")
    print("Response:")
    print(json.dumps(response.json(), indent=2))
    print("-" * 50)

def test_health_check():
    print("\nTesting Health Check Endpoint...")
    response = requests.get(f"{BASE_URL}/")
    print_response(response)
    return response.json()

def test_create_room():
    print("\nTesting Room Creation...")
    room_name = f"test-room-{int(time.time())}"  # Create unique room name
    data = {
        "name": room_name,
        "host_name": "Test Host"
    }
    response = requests.post(f"{BASE_URL}/api/rooms", json=data)
    print_response(response)
    return response.json()

def test_get_room(room_name: str):
    print(f"\nTesting Get Room Details for {room_name}...")
    response = requests.get(f"{BASE_URL}/api/rooms/{room_name}")
    print_response(response)
    return response.json()

def test_create_token(room_name: str):
    print("\nTesting Token Creation...")
    data = {
        "participant_name": "Test Participant",
        "is_owner": False,
        "expires_in_hours": 2
    }
    response = requests.post(f"{BASE_URL}/api/rooms/{room_name}/tokens", json=data)
    print_response(response)
    return response.json()

def test_send_invitation(room_name: str):
    print("\nTesting Send Invitation...")
    data = {
        "participant_email": "test@example.com",
        "host_name": "Test Host",
        "expires_in_hours": 2
    }
    response = requests.post(f"{BASE_URL}/api/rooms/{room_name}/invitations", json=data)
    print_response(response)
    return response.json()

def run_all_tests():
    try:
        # Test 1: Health Check
        health_check = test_health_check()
        
        # Test 2: Create Room
        room = test_create_room()
        room_name = room.get("name")
        
        if room_name:
            # Test 3: Get Room Details
            room_details = test_get_room(room_name)
            
            # Test 4: Create Token
            token = test_create_token(room_name)
            
            # Test 5: Send Invitation
            invitation = test_send_invitation(room_name)
            
    except requests.exceptions.RequestException as e:
        print(f"\nError: {str(e)}")
    except Exception as e:
        print(f"\nUnexpected error: {str(e)}")

if __name__ == "__main__":
    run_all_tests() 