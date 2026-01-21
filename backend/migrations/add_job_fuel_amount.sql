-- İşlere yakıt miktarı ekleme migration
ALTER TABLE jobs 
ADD COLUMN fuel_amount DECIMAL(10,2) NULL AFTER income_amount;
