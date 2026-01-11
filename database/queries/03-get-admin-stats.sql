-- 1. Tarjeta de Donaciones (KPI)
-- Subdominio: colaboración
SELECT COALESCE(SUM(amount), 0) as "totalDonations" 
FROM donations;

-- 2. Actividad de la Plataforma (Gráfica Lineal)
-- Subdominio: iniciativas
SELECT 
    EXTRACT(MONTH FROM ca.created_at) as month,
    EXTRACT(YEAR FROM ca.created_at) as year,
    ca.community_id as community_id,
    COUNT(ca.id) as new_causes
FROM causes ca
WHERE ca.created_at > NOW() - INTERVAL '6 months'
GROUP BY EXTRACT(MONTH FROM ca.created_at), EXTRACT(YEAR FROM ca.created_at), ca.community_id
ORDER BY year, month;

-- 3. Distribución de ODS (Gráfica Donut)
-- Subdominio: iniciativas
SELECT ods as ods_id, COUNT(*) as count 
FROM causes 
GROUP BY ods 
ORDER BY count DESC;

-- 4. Desglose por Comunidad I (Gráfica de Barras Apiladas)
-- Subdominio: comunidades
SELECT
    c.id as community_id,
    c.name as community,
    -- Contamos usuarios normales
    COUNT(DISTINCT m.user_id) FILTER (WHERE m.admin = false) as users,
    -- Contamos administradores
    COUNT(DISTINCT m.user_id) FILTER (WHERE m.admin = true) as admins
FROM communities c
LEFT JOIN community_members m ON c.id = m.community_id
GROUP BY c.id;

-- 5. Desglose por Comunidad II (Gráfica de Barras Apiladas)
-- Subdominio: iniciativas
WITH supports_cte AS (
    -- Pre-calculamos los apoyos por comunidad
    SELECT 
        cau.community_id, 
        COUNT(vl.id) as total_supports
    FROM volunteer_logs vl
    JOIN actions a ON vl.action_id = a.id
    JOIN causes cau ON a.cause_id = cau.id
    GROUP BY cau.community_id
)
SELECT
    ca.community_id as community_id,
    -- Causas activas
    COUNT(DISTINCT ca.id) FILTER (WHERE ca.closed = false) as active_causes,
    -- Causas cerradas
    COUNT(DISTINCT ca.id) FILTER (WHERE ca.closed = true) as closed_causes,
    -- ODS cubiertos
    COUNT(DISTINCT ca.ods) as ods_covered,
    -- Apoyos (traídos desde el CTE)
    COALESCE(s.total_supports, 0) as supports
FROM causes ca
LEFT JOIN supports_cte s ON ca.community_id = s.community_id -- JOIN con el CTE
GROUP BY ca.community_id, s.total_supports;
