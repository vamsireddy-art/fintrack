-- Run this in your Supabase SQL Editor to add the missing admin_id columns

ALTER TABLE customers ADD COLUMN admin_id UUID;
ALTER TABLE transactions ADD COLUMN admin_id UUID;

-- Optional: if you want to link it to the admins table (assuming admins table has an 'id' column)
-- ALTER TABLE customers ADD COLUMN admin_id UUID REFERENCES admins(id) ON DELETE CASCADE;
-- ALTER TABLE transactions ADD COLUMN admin_id UUID REFERENCES admins(id) ON DELETE CASCADE;

-- If your schema cache isn't updating automatically, run this command in the SQL editor:
NOTIFY pgrst, 'reload schema';
