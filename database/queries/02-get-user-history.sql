-- 1. Información del Usuario
SELECT *
FROM users 
WHERE id = '20000000-0000-4000-8000-000000000001';

-- 2. Lista de Comunidades
SELECT c.*
FROM community_members m 
LEFT JOIN communities c ON m.community_id = c.id
WHERE m.user_id = '20000000-0000-4000-8000-000000000001';

-- 3. Lista de Causas Apoyadas
SELECT cs.*
FROM cause_supports cs 
WHERE cs.user_id = '20000000-0000-4000-8000-000000000001';

-- 4. Historial de Donaciones
SELECT d.*
FROM donations d 
WHERE d.user_id = '20000000-0000-4000-8000-000000000001';

-- 5. Historial de Voluntariado
SELECT vl.*
FROM volunteer_logs vl 
LEFT JOIN actions a ON vl.action_id = a.id
WHERE vl.user_id = '20000000-0000-4000-8000-000000000001';
