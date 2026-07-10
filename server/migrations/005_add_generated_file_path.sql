-- Migration to add generated_file_path column to smart_letter_submissions
ALTER TABLE smart_letter_submissions
ADD COLUMN IF NOT EXISTS generated_file_path TEXT;
