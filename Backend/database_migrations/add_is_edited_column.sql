-- Migration: Add isEdited column to track edited model-generated detections
-- Date: 2025-10-22
-- Description: Adds a boolean column to inspection_model_detects table to track
--              when a model-generated detection has been edited by an inspector

-- Add isEdited column with default value of false (0)
ALTER TABLE inspection_model_detects 
ADD COLUMN is_edited BOOLEAN DEFAULT FALSE;

-- Update comment for documentation
COMMENT ON COLUMN inspection_model_detects.is_edited IS 
'Indicates if a model-generated detection has been edited by an inspector';

-- Optional: Set existing records to false explicitly (redundant but clear)
UPDATE inspection_model_detects 
SET is_edited = FALSE 
WHERE is_edited IS NULL;
