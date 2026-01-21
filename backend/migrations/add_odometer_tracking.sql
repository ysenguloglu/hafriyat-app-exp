-- Araç kilometre takibi ekleme migration
ALTER TABLE vehicles 
ADD COLUMN current_odometer INT NULL AFTER is_active;

ALTER TABLE jobs 
ADD COLUMN odometer_start INT NULL AFTER fuel_amount,
ADD COLUMN odometer_end INT NULL AFTER odometer_start;
