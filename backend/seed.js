const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const bcrypt = require('bcryptjs');
const supabase = require('./config/supabase');

const seedAdmin = async () => {
  try {
    const { count, error } = await supabase.from('admins').select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase query error:', error.message);
      process.exit(1);
    }

    if (count && count > 0) {
      console.log('Admin account already exists in Supabase.');
      process.exit(0);
    }

    const username = 'admin';
    const password = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { error: insertErr } = await supabase.from('admins').insert([
      {
        username,
        password: hashedPassword,
        auth_provider: 'local'
      }
    ]);

    if (insertErr) {
      console.error('Error inserting admin into Supabase:', insertErr.message);
      process.exit(1);
    }
    
    console.log(`✅ Supabase Admin created successfully. Username: ${username}, Password: ${password}`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
