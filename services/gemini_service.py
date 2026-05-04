import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("AIzaSyCXJ_1qDBQMAYd1AJTlh5bQ_JDDVj5pBkU")
if GEMINI_API_KEY:
    genai.configure(api_key=AIzaSyCXJ_1qDBQMAYd1AJTlh5bQ_JDDVj5pBkU)


def analyze_device_behavior(device_data: dict) -> str:
    """
    Analyze device behavior using Gemini AI.
    
    Args:
        device_data: Dictionary containing device information
        
    Returns:
        AI analysis as string
    """
    if not GEMINI_API_KEY:
        return "Error: Gemini API key not configured"
    
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        prompt = f"""
        Act as a cybersecurity expert for a Wi-Fi Intrusion Detection System.
        Analyze this network device and provide security insights:
        
        Device Info:
        - MAC: {device_data.get('mac', 'Unknown')}
        - IP: {device_data.get('ip', 'Unknown')}
        - Vendor: {device_data.get('vendor', 'Unknown')}
        - RSSI: {device_data.get('rssi', 'Unknown')} dBm
        - Status: {device_data.get('status', 'Unknown')}
        - Threat Score: {device_data.get('threat_score', 0)}/100
        
        Provide:
        1. Threat Classification (Minimal/Low/Medium/High/Critical)
        2. Behavioral Analysis
        3. Recommended Actions
        """
        
        response = model.generate_content(prompt)
        return response.text if response.text else "No analysis available"
        
    except Exception as e:
        return f"Analysis error: {str(e)}"


def get_security_recommendations(threat_level: str, device_info: dict) -> str:
    """
    Get security recommendations based on threat level.
    """
    if not GEMINI_API_KEY:
        return "Error: Gemini API key not configured"
    
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        prompt = f"""
        Provide 3 specific security mitigation steps for:
        - Threat Level: {threat_level}
        - Device: {device_info.get('mac', 'Unknown')}
        - Vendor: {device_info.get('vendor', 'Unknown')}
        
        Format as a numbered list.
        """
        
        response = model.generate_content(prompt)
        return response.text if response.text else "No recommendations available"
        
    except Exception as e:
        return f"Error: {str(e)}"�jh��,�jh��(�	^�z�������