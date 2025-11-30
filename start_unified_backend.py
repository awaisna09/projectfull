#!/usr/bin/env python3
"""
Unified Backend Service Startup Script
This script starts the unified backend combining AI Tutor and
Grading API on port 8000
"""

import os
import sys
from pathlib import Path

# Fix Windows console encoding for emoji support
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        # Python < 3.7 doesn't have reconfigure
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')


def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Error: Python 3.8 or higher is required")
        print(f"Current version: {sys.version}")
        sys.exit(1)
    print(f"✅ Python version: {sys.version.split()[0]}")


def check_dependencies():
    """Check if required packages are installed"""
    required_packages = [
        'fastapi',
        'uvicorn',
        'langchain',
        'langchain-openai',
        'openai',
        'dotenv',
        'pydantic'
    ]

    missing_packages = []

    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package}")
        except ImportError:
            missing_packages.append(package)
            print(f"❌ {package}")

    if missing_packages:
        print(f"\n❌ Missing packages: {', '.join(missing_packages)}")
        print("Please install them using: pip install -r requirements.txt")
        return False

    return True


def check_env_file():
    """Check if config.env file exists and has required variables"""
    env_file = Path('config.env')
    if not env_file.exists():
        print("❌ ERROR: config.env file not found")
        print("Please create a config.env file with your API keys:")
        print("OPENAI_API_KEY=your_key_here")
        print("LANGSMITH_API_KEY=your_key_here (optional)")
        return False

    # Check if file has content
    if env_file.stat().st_size == 0:
        print("❌ ERROR: config.env file is empty")
        return False

    print("✅ config.env file found")
    return True


def load_env_vars():
    """Load and validate environment variables"""
    try:
        from dotenv import load_dotenv
        load_dotenv('config.env')

        # Check for required API key
        openai_key = os.getenv('OPENAI_API_KEY')
        if not openai_key:
            print("❌ ERROR: OPENAI_API_KEY not found in config.env")
            return False

        # Check for optional LangSmith key
        langsmith_key = os.getenv('LANGSMITH_API_KEY')
        if langsmith_key:
            print("✅ LangSmith API key found")
        else:
            print("⚠️  LangSmith API key not found (optional)")

        print("✅ Environment variables loaded successfully")
        return True

    except ImportError:
        print("❌ ERROR: dotenv not installed")
        return False
    except Exception as e:
        print(f"❌ ERROR loading environment: {e}")
        return False


def start_service():
    """Start the unified backend service"""
    print("\n🚀 Starting Unified Backend Service...")

    try:
        # Import and run the service
        from unified_backend import app
        import uvicorn

        # Get port from environment or config
        from dotenv import load_dotenv
        load_dotenv('config.env')
        port = int(os.getenv('PORT', '8000'))
        host = os.getenv('HOST', '0.0.0.0')

        print("✅ Unified backend imported successfully")
        print(f"🌐 Starting server on http://{host}:{port}")
        print(f"📚 API Documentation: http://{host}:{port}/docs")
        print(f"🔍 Health Check: http://{host}:{port}/health")
        print(f"📊 Grading API: http://{host}:{port}/grade-answer")
        print(f"🤖 AI Tutor: http://{host}:{port}/tutor/chat")
        print("\nPress Ctrl+C to stop the service")

        uvicorn.run(app, host=host, port=port)

    except ImportError as e:
        print(f"❌ Error importing unified backend: {e}")
        print("Please check that all dependencies are installed")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error starting service: {e}")
        sys.exit(1)


def main():
    """Main function"""
    print("🤖 Unified Backend Service Startup")
    print("=" * 50)
    print("This service combines:")
    print("  • AI Tutor Service")
    print("  • Answer Grading API")
    print("  • All on port 8000")
    print("=" * 50)

    # Check Python version
    check_python_version()

    # Check dependencies
    print("\n📦 Checking dependencies...")
    if not check_dependencies():
        sys.exit(1)

    # Check environment file
    print("\n🔧 Checking configuration...")
    check_env_file()

    # Load environment variables
    if not load_env_vars():
        sys.exit(1)

    # Start the service
    start_service()


if __name__ == "__main__":
    main()
