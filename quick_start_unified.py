#!/usr/bin/env python3
"""
Quick Start Script for Unified Backend
This script quickly checks configuration and starts the unified backend service
"""

import os
import sys
from pathlib import Path

def quick_check():
    """Quick configuration and dependency check"""
    print("🔍 Quick Configuration Check...")
    
    # Check config.env exists
    if not Path('config.env').exists():
        print("❌ config.env not found!")
        print("   Please create config.env with your configuration")
        print("   See config.env.example for reference")
        return False
    
    # Check OpenAI API key
    from dotenv import load_dotenv
    load_dotenv('config.env')
    
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ OPENAI_API_KEY not found in config.env!")
        return False
    
    print(f"✅ OpenAI API Key: {api_key[:20]}...")
    
    # Check port
    port = os.getenv('PORT', '8000')
    print(f"✅ Port: {port}")
    
    # Check models
    tutor_model = os.getenv('TUTOR_MODEL', 'gpt-4')
    grading_model = os.getenv('GRADING_MODEL', 'gpt-4')
    print(f"✅ AI Tutor Model: {tutor_model}")
    print(f"✅ Grading Model: {grading_model}")
    
    return True

def start_service():
    """Start the unified backend service"""
    print("\n🚀 Starting Unified Backend...")
    
    try:
        # Import and start
        from unified_backend import app
        import uvicorn
        
        print("✅ Service imported successfully")
        
        # Get configuration
        from dotenv import load_dotenv
        load_dotenv('config.env')
        
        host = os.getenv('HOST', '0.0.0.0')
        port = int(os.getenv('PORT', '8000'))
        log_level = os.getenv('LOG_LEVEL', 'INFO').lower()
        
        print(f"🌐 Starting on {host}:{port}")
        print(f"📖 Documentation: http://localhost:{port}/docs")
        print(f"🔍 Health Check: http://localhost:{port}/health")
        print("\nPress Ctrl+C to stop")
        
        uvicorn.run(app, host=host, port=port, log_level=log_level)
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("   Please install dependencies: pip install -r requirements.txt")
        return False
    except Exception as e:
        print(f"❌ Error starting service: {e}")
        return False

def main():
    """Main function"""
    print("🤖 Unified Backend Quick Start")
    print("=" * 40)
    
    # Quick check
    if not quick_check():
        print("\n❌ Configuration check failed!")
        print("   Please fix the issues above and try again")
        sys.exit(1)
    
    # Start service
    start_service()

if __name__ == "__main__":
    main()
