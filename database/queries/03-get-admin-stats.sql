-- 1. Tarjeta de Donaciones (KPI)
SELECT COALESCE(SUM(amount), 0) as "totalDonations" 
FROM donations;

-- 2. Actividad de la Plataforma (Gráfica Lineal)
SELECT 
    EXTRACT(MONTH FROM ca.created_at) as month,
    EXTRACT(YEAR FROM ca.created_at) as year,
    c.name as community,
    COUNT(ca.id) as value
FROM causes ca
JOIN communities c ON ca.community_id = c.id
WHERE ca.created_at > NOW() - INTERVAL '6 months'
GROUP BY EXTRACT(MONTH FROM ca.created_at), EXTRACT(YEAR FROM ca.created_at), c.name
ORDER BY year, month;

-- 3. Distribución de ODS (Gráfica Donut)
SELECT ods as ods_id, COUNT(*) as count 
FROM causes 
GROUP BY ods 
ORDER BY count DESC;

-- 4. Desglose por Comunidad (Gráfica de Barras Apiladas)
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
    c.name as community,
    -- Contamos usuarios normales
    COUNT(DISTINCT m.user_id) FILTER (WHERE m.admin = false) as users,
    -- Contamos administradores
    COUNT(DISTINCT m.user_id) FILTER (WHERE m.admin = true) as admins,
    -- Causas activas
    COUNT(DISTINCT ca.id) FILTER (WHERE ca.closed = false) as active_causes,
    -- Causas cerradas
    COUNT(DISTINCT ca.id) FILTER (WHERE ca.closed = true) as closed_causes,
    -- ODS cubiertos
    COUNT(DISTINCT ca.ods) as ods_covered,
    -- Apoyos (traídos desde el CTE)
    COALESCE(s.total_supports, 0) as supports
FROM communities c
LEFT JOIN community_members m ON c.id = m.community_id
LEFT JOIN causes ca ON c.id = ca.community_id
LEFT JOIN supports_cte s ON c.id = s.community_id -- JOIN con el CTE
GROUP BY c.id, c.name, s.total_supports;
