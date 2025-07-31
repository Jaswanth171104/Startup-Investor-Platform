import requests
import time

def test_simple_pitch_deck():
    print("Testing simple pitch deck download...")
    
    # Wait for server
    time.sleep(2)
    
    try:
        # Test direct file access
        response = requests.head("http://localhost:8000/uploads/pitch_decks/test_pitch_deck_1.pdf")
        print(f"Direct file access: {response.status_code}")
        
        # Test download endpoint
        response = requests.head("http://localhost:8000/applications/download-pitch-deck/2")
        print(f"Download endpoint: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Pitch deck download is working!")
        else:
            print(f"❌ Download failed: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_simple_pitch_deck() 