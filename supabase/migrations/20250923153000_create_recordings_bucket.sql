-- Create 'recordings' storage bucket if it doesn't exist and open simple policies
insert into storage.buckets (id, name, public)
values ('recordings', 'recordings', true)
on conflict (id) do nothing;

-- Allow public read access to objects in 'recordings' bucket
drop policy if exists "Public read for recordings" on storage.objects;
create policy "Public read for recordings"
  on storage.objects for select
  using (bucket_id = 'recordings');

-- Allow inserts into 'recordings' bucket (you may tighten later)
drop policy if exists "Insert recordings" on storage.objects;
create policy "Insert recordings"
  on storage.objects for insert
  with check (bucket_id = 'recordings');

-- Optionally allow updates/deletes by anyone (dev only) - tighten in prod
drop policy if exists "Update recordings" on storage.objects;
create policy "Update recordings"
  on storage.objects for update
  using (bucket_id = 'recordings');

drop policy if exists "Delete recordings" on storage.objects;
create policy "Delete recordings"
  on storage.objects for delete
  using (bucket_id = 'recordings');
