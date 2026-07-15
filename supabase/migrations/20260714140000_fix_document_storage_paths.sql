-- Fix legacy document_uploads.storage_path values that incorrectly include the
-- bucket name prefix ("documents/"). Storage object names must be relative to
-- the bucket: "<user_id>/<file_name>".

UPDATE public.document_uploads
SET storage_path = substring(storage_path FROM 11)
WHERE storage_path LIKE 'documents/%';
