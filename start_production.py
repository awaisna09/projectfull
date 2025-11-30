#!/usr/bin/env python3
"""
Production AI Tutor Service Startup Script
This script provides production-ready startup with proper logging and error handling.
"""

import os
import sys
import logging
from pathlib import Path
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ai_tutor.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

def check_environment():
    """Check and validate environment setup"""
    logger.info("🔍 Checking environment setup...")
    
    # Check Python version
    if sys.version_info < (3, 8):
        logger.error("❌ Python 3.8 or higher is required")
        return False
    
    # Check config file
    config_file = Path('config.env')
    if not config_file.exists():
        logger.error("❌ config.env file not found")
        return False
    
    # Load environment variables
    load_dotenv('config.env')
    
    # Validate required variables
    required_vars = ['OPENAI_API_KEY']
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        logger.error(f"❌ Missing required environment variables: {missing_vars}")
        return False
    
    logger.info("✅ Environment setup validated")
    return True

def check_dependencies():
    """Check if required packages are installed"""
    logger.info("📦 Checking dependencies...")
    
    required_packages = [
        'fastapi',
        'uvicorn',
        'openai',
        'python-dotenv',
        'pydantic'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            logger.info(f"✅ {package}")
        except ImportError:
            missing_packages.append(package)
            logger.error(f"❌ {package}")
    
    if missing_packages:
        logger.error(f"❌ Missing packages: {', '.join(missing_packages)}")
        logger.info("Please install using: pip install -r requirements.txt")
        return False
    
    return True

def start_production_service():
    """Start the production AI Tutor service"""
    try:
        logger.info("🚀 Starting production AI Tutor service...")
        
        # Import and run the service
        from simple_ai_tutor import app
        import uvicorn
        
        # Production configuration
        config = uvicorn.Config(
            app=app,
            host="0.0.0.0",
            port=8000,
            log_level="info",
            access_log=True,
            workers=1,  # Single worker for now
            loop="asyncio"
        )
        
        server = uvicorn.Server(config)
        logger.info("✅ Service configured successfully")
        logger.info("🌐 Starting server on http://0.0.0.0:8000")
        logger.info("📚 API Documentation: http://0.0.0.0:8000/docs")
        logger.info("🔍 Health Check: http://0.0.0.0:8000/tutor/health")
        
        server.run()
        
    except ImportError as e:
        logger.error(f"❌ Error importing service: {e}")
        return False
    except Exception as e:
        logger.error(f"❌ Error starting service: {e}")
        return False

def main():
    """Main function"""
    logger.info("🤖 Production AI Tutor Service Startup")
    logger.info("=" * 50)
    
    # Check environment
    if not check_environment():
        sys.exit(1)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Start service
    if not start_production_service():
        sys.exit(1)

if __name__ == "__main__":
    main()
