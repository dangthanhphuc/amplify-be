

SELECT 
                    a.id,                    -- record[0]
                    a.name,                  -- record[1]  
                    a.icon,                  -- record[2]
                    a.introduction,          -- record[3]
                    a.description,           -- record[4]
                    a.foreword,              -- record[5]
                    a.last_version,          -- record[6]
                    a.status,                -- record[7]
                    a.like_count,            -- record[8]
                    a.total_interactions,    -- record[9]
                    a.creator_id,            -- record[10]
                    a.knowledge_base_url,    -- record[11]
                    a.sys_prompt,            -- record[12]
                    a.create_at,             -- record[13]
                    a.model,                 -- record[14]
                    a.capabilities,          -- record[15]
                    a.alias_ids,             -- record[16]
                    a.cost,                  -- record[17]
                    u.name as creator_name,  -- record[18]
                    a.suggested_questions ,
                    JSON_ARRAYAGG(
                        CASE 
                            WHEN ac.name IS NOT NULL 
                            THEN JSON_OBJECT('id', ac.id, 'name', ac.name) 
                            ELSE NULL 
                        END
                    ) as categories          -- record[19]
                FROM ai_agents a
                LEFT JOIN ai_categories aic ON a.id = aic.ai_agent_id
                LEFT JOIN users u ON a.creator_id = u.id
                LEFT JOIN agent_categories ac ON aic.agent_category_id = ac.id
                GROUP BY a.id
                ORDER BY a.create_at DESC
                
                
