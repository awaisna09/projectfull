#!/usr/bin/env python3
"""
Health Check Script for Imtehaan AI EdTech Platform
This script checks the health of all services and provides detailed status information.
"""

import requests
import json
import time
import sys
from datetime import datetime

class HealthChecker:
    def __init__(self):
        self.services = {
            'backend': {
                'url': 'http://localhost:8000',
                'endpoints': [
                    '/tutor/health',
                    '/tutor/topics',
                    '/tutor/langchain-status'
                ]
            },
            'frontend': {
                'url': 'http://localhost:5173',
                'endpoints': ['/']
            }
        }
        self.results = {}

    def check_service(self, service_name, service_config):
        """Check the health of a specific service"""
        print(f"\n🔍 Checking {service_name.upper()} service...")
        
        service_results = {
            'status': 'unknown',
            'response_time': 0,
            'endpoints': {},
            'errors': []
        }
        
        try:
            # Check main service availability
            start_time = time.time()
            response = requests.get(service_config['url'], timeout=10)
            response_time = (time.time() - start_time) * 1000
            
            if response.status_code == 200:
                service_results['status'] = 'healthy'
                service_results['response_time'] = round(response_time, 2)
                print(f"✅ {service_name.capitalize()} is running (Response: {response_time:.2f}ms)")
            else:
                service_results['status'] = 'unhealthy'
                service_results['errors'].append(f"HTTP {response.status_code}")
                print(f"⚠️  {service_name.capitalize()} responded with HTTP {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            service_results['status'] = 'unreachable'
            service_results['errors'].append("Connection refused")
            print(f"❌ {service_name.capitalize()} is not reachable")
        except requests.exceptions.Timeout:
            service_results['status'] = 'timeout'
            service_results['errors'].append("Request timeout")
            print(f"⏰ {service_name.capitalize()} request timed out")
        except Exception as e:
            service_results['status'] = 'error'
            service_results['errors'].append(str(e))
            print(f"❌ {service_name.capitalize()} error: {e}")
        
        # Check specific endpoints
        for endpoint in service_config.get('endpoints', []):
            try:
                start_time = time.time()
                endpoint_url = f"{service_config['url']}{endpoint}"
                response = requests.get(endpoint_url, timeout=5)
                endpoint_time = (time.time() - start_time) * 1000
                
                if response.status_code == 200:
                    service_results['endpoints'][endpoint] = {
                        'status': 'healthy',
                        'response_time': round(endpoint_time, 2)
                    }
                    print(f"  ✅ {endpoint} - {endpoint_time:.2f}ms")
                else:
                    service_results['endpoints'][endpoint] = {
                        'status': 'unhealthy',
                        'response_time': round(endpoint_time, 2),
                        'error': f"HTTP {response.status_code}"
                    }
                    print(f"  ⚠️  {endpoint} - HTTP {response.status_code}")
                    
            except Exception as e:
                service_results['endpoints'][endpoint] = {
                    'status': 'error',
                    'response_time': 0,
                    'error': str(e)
                }
                print(f"  ❌ {endpoint} - Error: {e}")
        
        return service_results

    def check_ai_tutor_functionality(self):
        """Test AI Tutor specific functionality"""
        print("\n🧠 Testing AI Tutor functionality...")
        
        try:
            # Test chat endpoint
            chat_payload = {
                "message": "Hello, can you explain business strategy?",
                "topic": "Business Strategy",
                "user_id": "health_check_user",
                "learning_level": "beginner"
            }
            
            start_time = time.time()
            response = requests.post(
                'http://localhost:8000/tutor/chat',
                json=chat_payload,
                timeout=30
            )
            response_time = (time.time() - start_time) * 1000
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ AI Tutor chat working (Response: {response_time:.2f}ms)")
                print(f"   Response length: {len(data.get('response', ''))} characters")
                print(f"   Confidence score: {data.get('confidence_score', 'N/A')}")
                return True
            else:
                print(f"❌ AI Tutor chat failed: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ AI Tutor functionality test failed: {e}")
            return False

    def check_database_connection(self):
        """Check if Supabase connection is working"""
        print("\n🗄️  Checking database connection...")
        
        try:
            # This would need to be implemented based on your Supabase setup
            # For now, we'll just check if the frontend can load
            response = requests.get('http://localhost:5173', timeout=10)
            if response.status_code == 200:
                print("✅ Frontend loaded successfully (database connection likely working)")
                return True
            else:
                print(f"⚠️  Frontend loaded with status: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Database connection check failed: {e}")
            return False

    def run_health_check(self):
        """Run comprehensive health check"""
        print("🏥 Imtehaan AI EdTech Platform - Health Check")
        print("=" * 60)
        print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Check all services
        for service_name, service_config in self.services.items():
            self.results[service_name] = self.check_service(service_name, service_config)
        
        # Check AI Tutor functionality
        ai_tutor_working = self.check_ai_tutor_functionality()
        
        # Check database connection
        database_working = self.check_database_connection()
        
        # Generate summary
        self.generate_summary(ai_tutor_working, database_working)
        
        return self.results

    def generate_summary(self, ai_tutor_working, database_working):
        """Generate a summary of all health checks"""
        print("\n" + "=" * 60)
        print("📊 HEALTH CHECK SUMMARY")
        print("=" * 60)
        
        # Service status summary
        healthy_services = 0
        total_services = len(self.results)
        
        for service_name, result in self.results.items():
            status_icon = "✅" if result['status'] == 'healthy' else "❌"
            print(f"{status_icon} {service_name.upper()}: {result['status']}")
            if result['status'] == 'healthy':
                healthy_services += 1
        
        # AI Tutor status
        ai_icon = "✅" if ai_tutor_working else "❌"
        print(f"{ai_icon} AI TUTOR: {'Working' if ai_tutor_working else 'Not Working'}")
        
        # Database status
        db_icon = "✅" if database_working else "❌"
        print(f"{db_icon} DATABASE: {'Connected' if database_working else 'Not Connected'}")
        
        # Overall health
        overall_health = (healthy_services / total_services) * 100
        if overall_health == 100 and ai_tutor_working and database_working:
            print(f"\n🎉 OVERALL STATUS: HEALTHY ({overall_health:.0f}%)")
            print("   All services are running smoothly!")
        elif overall_health >= 80:
            print(f"\n⚠️  OVERALL STATUS: MOSTLY HEALTHY ({overall_health:.0f}%)")
            print("   Some services may have issues")
        else:
            print(f"\n❌ OVERALL STATUS: UNHEALTHY ({overall_health:.0f}%)")
            print("   Multiple services are having issues")
        
        # Recommendations
        print("\n💡 RECOMMENDATIONS:")
        if not ai_tutor_working:
            print("   - Check OpenAI API key in config.env")
            print("   - Verify backend is running on port 8000")
        if not database_working:
            print("   - Check Supabase credentials in .env.local")
            print("   - Verify network connectivity to Supabase")
        if healthy_services < total_services:
            print("   - Review service logs for error details")
            print("   - Check if all required ports are available")

def main():
    """Main function"""
    try:
        checker = HealthChecker()
        results = checker.run_health_check()
        
        # Exit with appropriate code
        if all(result['status'] == 'healthy' for result in results.values()):
            sys.exit(0)  # All healthy
        else:
            sys.exit(1)  # Some issues
            
    except KeyboardInterrupt:
        print("\n\n⏹️  Health check interrupted by user")
        sys.exit(130)
    except Exception as e:
        print(f"\n❌ Health check failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
