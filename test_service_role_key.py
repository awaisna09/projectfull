#!/usr/bin/env python3
"""
Quick test to verify which Supabase key is being used
"""

import os
from dotenv import load_dotenv

load_dotenv("config.env")

service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
anon_key = os.getenv("SUPABASE_ANON_KEY")

print("="*70)
print("  SUPABASE KEY VERIFICATION")
print("="*70)

if service_key:
    print(f"\n✅ SUPABASE_SERVICE_ROLE_KEY: Found ({len(service_key)} chars)")
    print(f"   First 20 chars: {service_key[:20]}...")
    print(f"   Last 20 chars: ...{service_key[-20:]}")
    # Service role key typically starts with eyJ and is longer
    if service_key.startswith("eyJ") and len(service_key) > 200:
        print("   ✅ Looks like a valid JWT token (service role)")
    else:
        print("   ⚠️  May not be a valid service role key")
else:
    print("\n❌ SUPABASE_SERVICE_ROLE_KEY: NOT FOUND")

if anon_key:
    print(f"\n✅ SUPABASE_ANON_KEY: Found ({len(anon_key)} chars)")
    print(f"   First 20 chars: {anon_key[:20]}...")
else:
    print("\n⚠️  SUPABASE_ANON_KEY: NOT FOUND")

# Check which one will be used
if service_key:
    print("\n✅ Code will use: SUPABASE_SERVICE_ROLE_KEY (should bypass RLS)")
elif anon_key:
    print("\n⚠️  Code will use: SUPABASE_ANON_KEY (will be subject to RLS)")
else:
    print("\n❌ No Supabase key found!")

print("\n" + "="*70)

