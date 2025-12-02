// Test the trigger fix
// Run with: node test-trigger-fix.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mwhtclxabiraowerfmkz.supabase.co'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY_HERE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testTriggerFix() {
  try {
    console.log('🔧 Testing Trigger Fix...')
    
    console.log('\n📋 BEFORE TESTING:')
    console.log('1. Go to: https://app.supabase.com/project/mwhtclxabiraowerfmkz')
    console.log('2. Navigate to: SQL Editor')
    console.log('3. Copy the content from: fix-trigger.sql')
    console.log('4. Paste and run the SQL script')
    console.log('5. This will fix the trigger function')
    
    console.log('\n🧪 AFTER RUNNING THE SQL:')
    console.log('1. Come back here and run this test again')
    console.log('2. Or test signup directly in your app')
    
    console.log('\n💡 WHAT THE FIX DOES:')
    console.log('- Handles missing metadata gracefully')
    console.log('- Uses proper JSONB casting for subjects and preferences')
    console.log('- Adds error handling to prevent signup failures')
    console.log('- Logs errors instead of failing the signup')
    
  } catch (err) {
    console.log('❌ Test error:', err.message)
  }
}

testTriggerFix() 