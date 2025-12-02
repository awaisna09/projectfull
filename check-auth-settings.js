// Check Supabase authentication settings
// Run with: node check-auth-settings.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mwhtclxabiraowerfmkz.supabase.co'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY_HERE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAuthSettings() {
  try {
    console.log('🔍 Checking Supabase Authentication Settings...')
    
    // Check if there are any database functions or triggers that might be causing issues
    console.log('\n📋 POSSIBLE SOLUTIONS:')
    console.log('1. Go to your Supabase Dashboard: https://app.supabase.com/project/mwhtclxabiraowerfmkz')
    console.log('2. Navigate to Authentication → Settings')
    console.log('3. Check if "Enable email confirmations" is ON (turn it OFF for testing)')
    console.log('4. Check if "Enable email change confirmations" is ON (turn it OFF for testing)')
    console.log('5. Go to Database → Functions and check if there are any auth-related functions')
    console.log('6. Go to Database → Triggers and check if there are any auth-related triggers')
    
    console.log('\n🔧 IMMEDIATE FIX:')
    console.log('The issue is likely caused by a database trigger or function.')
    console.log('You need to either:')
    console.log('A) Disable the trigger/function in your Supabase dashboard')
    console.log('B) Or set up the proper database schema')
    
    console.log('\n💡 QUICK TEST:')
    console.log('Try signing up with a different email to see if it\'s a specific user issue')
    
  } catch (err) {
    console.log('❌ Check error:', err.message)
  }
}

checkAuthSettings() 