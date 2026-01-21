-- İşlere başlangıç ve bitiş saatleri ekleme migration
ALTER TABLE jobs 
ADD COLUMN start_time TIME NULL AFTER date,
ADD COLUMN end_time TIME NULL AFTER start_time;
