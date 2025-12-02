import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bgenvwieabtxwzapgeee.supabase.co';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY_HERE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTopicsFetch() {
  console.log('=== Testing Topics Fetch with topic_id ===');
  
  try {
    // Test fetching topics for Business Studies
    console.log('\n1. Fetching topics for Business Studies...');
    const { data, error } = await supabase
      .from('topics')
      .select('topic_id, topic')
      .eq('subject_id', 101); // Business Studies subject_id
    
    if (error) {
      console.error('Error fetching topics:', error);
      return;
    }
    
    console.log('Raw database response:', data);
    
    if (data && data.length > 0) {
      console.log('\n2. Topics found:');
      data.forEach((topic, index) => {
        console.log(`  ${index + 1}. ID: ${topic.topic_id}, Title: ${topic.topic}`);
      });
      
      // Transform data like the service does
      const transformedData = data.map((topic) => ({
        id: topic.topic_id.toString(),
        topic_id: topic.topic_id,
        title: topic.topic,
        description: `Topic: ${topic.topic}`
      }));
      
      console.log('\n3. Transformed data:');
      transformedData.forEach((topic, index) => {
        console.log(`  ${index + 1}. ID: ${topic.id}, Topic ID: ${topic.topic_id}, Title: ${topic.title}`);
      });
      
      console.log('\n✅ Success! Topics are being fetched with topic_id');
    } else {
      console.log('No topics found in the database');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testTopicsFetch();
