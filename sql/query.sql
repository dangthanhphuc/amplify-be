

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
                
                
INSERT INTO ai_agents (
    id,
    name,
    icon,
    description,
    introduction,
    foreword,
    create_at,
    updated_at,
    suggested_questions,
    creator_id,
    is_public,
    like_count,
    total_interactions,
    alias_ids,
    sys_prompt,
    capabilities,
    model,
    cost,
    status,
    knowledge_base_url,
    last_version
) VALUES (
    UUID(),
    'Customer Support Assistant',
    '',
    'An AI assistant specialized in providing customer support, handling inquiries, and resolving common issues efficiently.',
    'I am a helpful customer support assistant that can help you with your questions and concerns.',
    'Welcome! I am here to assist you with any questions or problems you might have. Feel free to ask me anything!',
    NOW(),
    NOW(),
    '["How can I track my order?","What is your return policy?","How do I contact customer service?","What payment methods do you accept?"]',
    '1',
    0,
    0,
    0,
    '[]',
    '',
    '[]',
    '',
    0,
    'ACTIVE',
    '',
    '1.0.0'
);