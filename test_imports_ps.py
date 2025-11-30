#!/usr/bin/env python3
"""Simple import test for PowerShell"""

import sys
print(f"Python Version: {sys.version}")
print()

errors = []
success = []

# Test imports
imports_to_test = [
    ("fastapi", "fastapi"),
    ("uvicorn", "uvicorn"),
    ("pydantic", "pydantic"),
    ("openai", "openai"),
    ("langchain_openai", "langchain-openai"),
    ("dotenv", "python-dotenv"),
    ("supabase", "supabase"),
]

for module_name, package_name in imports_to_test:
    try:
        __import__(module_name)
        print(f"✅ {package_name}")
        success.append(package_name)
    except ImportError as e:
        print(f"❌ {package_name} - {e}")
        errors.append(package_name)

print()
print(f"✅ Success: {len(success)}")
print(f"❌ Failed: {len(errors)}")

if errors:
    print(f"\n⚠️  Missing packages: {', '.join(errors)}")
    print("Install with: pip install " + " ".join(errors))
    sys.exit(1)
else:
    print("\n✅ All packages installed!")
    sys.exit(0)


