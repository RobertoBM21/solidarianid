SELECT 
    c.id, 
    c.name, 
    c.description,
    COALESCE(m_stats.count, 0) as "memberCount",
    ca.id as "cause_id",
    ca.title as "cause_title",
    ca.description as "cause_description",
    ca.duration as "cause_duration",
    ca.ods as "cause_ods"
FROM 
    communities c
LEFT JOIN 
    (SELECT community_id, COUNT(*) as count FROM community_members GROUP BY community_id) m_stats 
    ON c.id = m_stats.community_id
LEFT JOIN 
    causes ca ON c.id = ca.community_id AND ca.closed = false
ORDER BY 
    c.created_at DESC, ca.created_at DESC;
