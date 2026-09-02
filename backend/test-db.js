require('dotenv').config();
const supabase = require('./config/supabase');

async function testSelect() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('admin_id', 'some-id');

  if (error) {
    console.error('Select error:', error);
  } else {
    console.log('Select success:', data);
  }
  process.exit();
}

testSelect();
