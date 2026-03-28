-- Remove placeholder illustration paths so the UI can display
-- "No image" until an actual equipment photo is uploaded.
UPDATE public.equipment
SET image_url = NULL
WHERE image_url IN (
    '/equipment-backpack.svg',
    '/equipment-fogger.svg',
    '/equipment-ulv.svg'
);
