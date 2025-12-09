-- Enable public update and insert on authors table
-- Run this in your Supabase SQL Editor

create policy "Allow public update to authors"
on authors for update using (true);

create policy "Allow public insert to authors"
on authors for insert with check (true);
