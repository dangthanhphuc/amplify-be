INSERT INTO roles (id, name)
VALUES (1, "role_name");

INSERT INTO users(id, name, display_name, profile_image, description, role_id)
VALUES (1, "name", "display_name", "profile_iamge", "desc", 1);

INSERT INTO ai_agents (
    id, name, status, description, last_version, knowledge_base_url,
    like_count, total_interactions, creator_id, introduction, icon,
    foreword, sys_prompt, create_at, model, capabilities, cost, alias_ids
)
VALUES (
    'DJXKGUDAOH', 
    'agent-anh2ti', 
    'PREPARED', 
    '', 
    '2', 
    '',
    0, 
    0, 
    1, 
    '', 
    '',
    '', 
    '', 
    '2025-05-21 15:11:17.666', 
    '', 
    '[]', 
    0, 
    '["TSTALIASID","ZL0NMFTCAN"]'
);
