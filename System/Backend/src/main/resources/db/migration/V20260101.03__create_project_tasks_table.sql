-- Create project_tasks table for ProjectTask entity
CREATE TABLE project_tasks (
    task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description VARCHAR(255) NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    order_index INTEGER,
    booking_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_project_tasks_booking_id 
        FOREIGN KEY (booking_id) 
        REFERENCES bookings (booking_id) 
        ON DELETE CASCADE
);

-- Create index for better query performance
CREATE INDEX idx_project_tasks_booking_id ON project_tasks(booking_id);
CREATE INDEX idx_project_tasks_order_index ON project_tasks(booking_id, order_index);
