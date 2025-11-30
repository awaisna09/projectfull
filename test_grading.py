#!/usr/bin/env python3
"""
Test script for the Answer Grading System
Demonstrates how to use the grading agent
"""

import requests
import json
import time

def test_grading_api():
    """Test the grading API endpoint"""
    
    # API endpoint
    url = "http://localhost:8001/grade-answer"
    
    # Test data
    test_cases = [
        {
            "name": "Market Segmentation - Basic Understanding",
            "question": "Explain the concept of market segmentation and its importance in business strategy.",
            "model_answer": """
            Market segmentation is the process of dividing a broad consumer or business market into sub-groups of consumers based on shared characteristics. This concept is crucial for business strategy for several reasons:
            
            1. **Targeted Marketing**: It allows businesses to focus their marketing efforts on specific customer groups, leading to more effective campaigns and higher conversion rates.
            
            2. **Product Development**: Understanding different segments helps in developing products that meet the specific needs and preferences of target customers.
            
            3. **Competitive Advantage**: By serving specific segments well, businesses can differentiate themselves from competitors and build customer loyalty.
            
            4. **Resource Allocation**: It enables efficient allocation of marketing and development resources to the most profitable customer segments.
            
            5. **Customer Satisfaction**: Tailored products and services lead to higher customer satisfaction and retention rates.
            
            Examples of segmentation criteria include demographic factors (age, income), geographic location, psychographic characteristics (lifestyle, values), and behavioral patterns (usage rate, brand loyalty).
            """,
            "student_answer": """
            Market segmentation is when you divide customers into groups. It's important because it helps businesses sell products better. You can target different people with different marketing. It also helps make products that people want. Companies can compete better this way.
            """
        },
        {
            "name": "SWOT Analysis - Good Understanding",
            "question": "What is SWOT analysis and how is it used in strategic planning?",
            "model_answer": """
            SWOT analysis is a strategic planning tool used to identify and analyze the Strengths, Weaknesses, Opportunities, and Threats involved in a project or business venture. It provides a framework for evaluating both internal and external factors that can impact the success of a business strategy.
            
            **Strengths**: Internal positive attributes that give the business an advantage over competitors. Examples include strong brand recognition, proprietary technology, skilled workforce, or financial resources.
            
            **Weaknesses**: Internal negative attributes that place the business at a disadvantage. Examples include limited resources, outdated technology, lack of expertise, or poor location.
            
            **Opportunities**: External factors that the business could exploit to its advantage. Examples include market growth, new technology, changes in regulations, or gaps in the market.
            
            **Threats**: External factors that could cause trouble for the business. Examples include new competitors, economic downturns, changing customer preferences, or regulatory changes.
            
            In strategic planning, SWOT analysis helps businesses:
            - Identify competitive advantages and areas for improvement
            - Develop strategies that leverage strengths and opportunities
            - Address weaknesses and mitigate threats
            - Make informed decisions about resource allocation
            - Align business objectives with market conditions
            """,
            "student_answer": """
            SWOT analysis is a strategic planning tool that helps businesses understand their position. It stands for Strengths, Weaknesses, Opportunities, and Threats.
            
            Strengths are what the business does well internally, like having a strong brand or good technology. Weaknesses are internal problems like limited resources or outdated systems.
            
            Opportunities are external chances for growth, such as new markets or technology changes. Threats are external risks like new competitors or economic problems.
            
            Businesses use SWOT analysis to:
            - Understand their competitive position
            - Identify areas to improve
            - Find new opportunities
            - Plan for potential risks
            - Make better strategic decisions
            
            This analysis helps companies focus their resources and develop effective strategies.
            """
        }
    ]
    
    print("🧪 Testing Answer Grading API")
    print("=" * 50)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📝 Test Case {i}: {test_case['name']}")
        print("-" * 40)
        
        try:
            # Send request to API
            response = requests.post(url, json={
                "question": test_case["question"],
                "model_answer": test_case["model_answer"],
                "student_answer": test_case["student_answer"],
                "subject": "Business Studies",
                "topic": "Strategic Management"
            })
            
            if response.status_code == 200:
                result = response.json()
                
                print("✅ Grading successful!")
                print(f"📊 Score: {result['result']['overall_score']}/50")
                print(f"📈 Percentage: {result['result']['percentage']}%")
                print(f"🎯 Grade: {result['result']['grade']}")
                
                print(f"\n✅ Strengths:")
                for strength in result['result']['strengths']:
                    print(f"  • {strength}")
                
                print(f"\n🔧 Areas for Improvement:")
                for area in result['result']['areas_for_improvement']:
                    print(f"  • {area}")
                
                print(f"\n💡 Suggestions:")
                for suggestion in result['result']['suggestions']:
                    print(f"  • {suggestion}")
                    
            else:
                print(f"❌ API Error: {response.status_code}")
                print(f"Response: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print("❌ Connection Error: Make sure the grading API is running on port 8001")
            print("Run: python grading_api.py")
            break
        except Exception as e:
            print(f"❌ Error: {e}")
        
        # Wait between tests
        if i < len(test_cases):
            print("\n⏳ Waiting 2 seconds before next test...")
            time.sleep(2)

def test_health_check():
    """Test the health check endpoint"""
    try:
        response = requests.get("http://localhost:8001/health")
        if response.status_code == 200:
            result = response.json()
            print("🏥 Health Check:")
            print(f"  Status: {result['status']}")
            print(f"  Grading Agent: {'✅ Ready' if result['grading_agent_ready'] else '❌ Not Ready'}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to grading API. Is it running?")

if __name__ == "__main__":
    print("🚀 Answer Grading System Test")
    print("=" * 40)
    
    # Test health check first
    test_health_check()
    print()
    
    # Test grading functionality
    test_grading_api()
    
    print("\n✨ Testing complete!")



















