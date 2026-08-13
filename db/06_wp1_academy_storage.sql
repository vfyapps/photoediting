-- =============================================================================
-- VfY AI Photo Editing App - V3-WP1: Academy-lesmateriaal in Storage
-- De bucket 'guidelines' bestond al maar had geen RLS-policies op
-- storage.objects (RLS staat standaard aan in Supabase) en geen limieten.
-- Zonder policy kon niemand behalve de service-role lezen of schrijven, en de
-- app gebruikte getPublicUrl() op een bucket die private staat - dat gaf
-- altijd een gebroken afbeelding. Idempotent: twee keer draaien is veilig.
-- =============================================================================

update storage.buckets
set file_size_limit = 5242880, -- 5 MB
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'guidelines';

drop policy if exists read_guideline_objects on storage.objects;
create policy read_guideline_objects on storage.objects for select to authenticated
  using (bucket_id = 'guidelines');

drop policy if exists write_guideline_objects on storage.objects;
create policy write_guideline_objects on storage.objects for insert to authenticated
  with check (bucket_id = 'guidelines' and is_coordinator());

drop policy if exists update_guideline_objects on storage.objects;
create policy update_guideline_objects on storage.objects for update to authenticated
  using (bucket_id = 'guidelines' and is_coordinator())
  with check (bucket_id = 'guidelines' and is_coordinator());

drop policy if exists delete_guideline_objects on storage.objects;
create policy delete_guideline_objects on storage.objects for delete to authenticated
  using (bucket_id = 'guidelines' and is_coordinator());
