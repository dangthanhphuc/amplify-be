-- Tạo database
CREATE DATABASE ai_agent_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ai_agent_system;

-- 1. Bảng không phụ thuộc
CREATE TABLE roles (
    id VARCHAR(255) PRIMARY KEY,
    name CHAR(50) NOT NULL
);

CREATE TABLE agent_categories (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE report_categories (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    severity INT
);

-- 2. Bảng users (phụ thuộc roles)
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255),
    password VARCHAR(255),
    name VARCHAR(100),
    display_name VARCHAR(100),
    profile_image VARCHAR(255),
    description TEXT,
    role_id VARCHAR(255),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- 3. Bảng ai_agents (phụ thuộc users)
CREATE TABLE ai_agents (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    icon VARCHAR(255),
    introduction TEXT,
    description TEXT,
    foreword VARCHAR(255),
    last_version VARCHAR(20),
    status VARCHAR(50),
    like_count INT DEFAULT 0,
    total_interactions INT DEFAULT 0,
    creator_id VARCHAR(255),
    knowledge_base_url VARCHAR(255),
    sys_prompt TEXT,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    model VARCHAR(255),
    capabilities JSON,
    alias_ids JSON,
    cost FLOAT,
    suggested_questions JSON,
    FOREIGN KEY (creator_id) REFERENCES users(id)
);

-- 4. Bảng liên kết nhiều-nhiều giữa ai_agents và agent_categories
CREATE TABLE ai_categories (
    ai_agent_id VARCHAR(255),
    agent_category_id VARCHAR(255),
    PRIMARY KEY (ai_agent_id, agent_category_id),
    FOREIGN KEY (ai_agent_id) REFERENCES ai_agents(id),
    FOREIGN KEY (agent_category_id) REFERENCES agent_categories(id)
);

-- 5. Các bảng phụ thuộc khác
CREATE TABLE user_likes (
    user_id VARCHAR(255),
    ai_agent_id VARCHAR(255),
    liked BOOLEAN,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, ai_agent_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (ai_agent_id) REFERENCES ai_agents(id)
);

CREATE TABLE ai_reviews (
    id VARCHAR(255) PRIMARY KEY,
    description TEXT,
    rating INT,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ai_agent_id VARCHAR(255),
    reporter_id VARCHAR(255),
    report_categories_id VARCHAR(255),
    FOREIGN KEY (ai_agent_id) REFERENCES ai_agents(id),
    FOREIGN KEY (reporter_id) REFERENCES users(id),
    FOREIGN KEY (report_categories_id) REFERENCES report_categories(id)
);

CREATE TABLE chats (
    id VARCHAR(255) PRIMARY KEY,
    raw_content NVARCHAR(255),
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(255),
    ai_agent_id VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (ai_agent_id) REFERENCES ai_agents(id)
);