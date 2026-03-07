-- Adds equipment relation and quantity to bookings, plus foreign key to inventory_items
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_item_id UUID;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_quantity NUMERIC(10,2);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        WHERE tc.table_name = 'bookings'
          AND tc.constraint_type = 'FOREIGN KEY'
          AND tc.constraint_name = 'fk_bookings_equipment_item'
    ) THEN
        ALTER TABLE bookings
            ADD CONSTRAINT fk_bookings_equipment_item
            FOREIGN KEY (equipment_item_id)
            REFERENCES inventory_items(item_id);
    END IF;
END $$;
