// Simple test script to verify Supabase connection
// Run with: node test-supabase.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mwhtclxabiraowerfmkz.supabase.co'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY_HERE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('🔗 Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase.from('questions').select('count').limit(1)
    
    if (error) {
      console.log('❌ Connection failed:', error.message)
      return
    }
    
    console.log('✅ Supabase connection successful!')
    console.log('📊 Database is accessible')
    
  } catch (err) {
    console.log('❌ Connection error:', err.message)
  }
}

testConnection() 