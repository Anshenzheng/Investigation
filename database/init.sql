-- 问集 - 调查问卷系统数据库初始化脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS wenji_survey DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE wenji_survey;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 问卷表
CREATE TABLE IF NOT EXISTS surveys (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status ENUM('DRAFT', 'PUBLISHED', 'CLOSED') NOT NULL DEFAULT 'DRAFT',
    is_anonymous BOOLEAN NOT NULL DEFAULT TRUE,
    deadline DATETIME,
    is_template BOOLEAN NOT NULL DEFAULT FALSE,
    created_by BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created_by (created_by),
    INDEX idx_is_template (is_template)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 题目表
CREATE TABLE IF NOT EXISTS questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    survey_id BIGINT NOT NULL,
    text VARCHAR(500) NOT NULL,
    type ENUM('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TEXT', 'RATING') NOT NULL,
    required BOOLEAN NOT NULL DEFAULT TRUE,
    order_index INT NOT NULL,
    INDEX idx_survey_id (survey_id),
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 选项表
CREATE TABLE IF NOT EXISTS question_options (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT NOT NULL,
    text VARCHAR(200) NOT NULL,
    order_index INT NOT NULL,
    INDEX idx_question_id (question_id),
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 问卷回复表
CREATE TABLE IF NOT EXISTS survey_responses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    survey_id BIGINT NOT NULL,
    user_id BIGINT,
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_survey_id (survey_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 答案表
CREATE TABLE IF NOT EXISTS answers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    response_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    question_type ENUM('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TEXT', 'RATING') NOT NULL,
    text_value TEXT,
    option_id BIGINT,
    option_ids VARCHAR(500),
    rating_value INT,
    INDEX idx_response_id (response_id),
    INDEX idx_question_id (question_id),
    INDEX idx_option_id (option_id),
    FOREIGN KEY (response_id) REFERENCES survey_responses(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES question_options(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 收藏表
CREATE TABLE IF NOT EXISTS favorites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    survey_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_survey (user_id, survey_id),
    INDEX idx_user_id (user_id),
    INDEX idx_survey_id (survey_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入默认管理员用户 (密码: admin123，使用BCrypt加密)
-- 注意：以下密码是使用 BCrypt 加密后的 "admin123"
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@wenji.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'ADMIN'),
('user', 'user@wenji.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'USER');

-- 插入示例问卷模板
INSERT INTO surveys (title, description, status, is_anonymous, is_template, created_by) VALUES 
('客户满意度调查问卷模板', '用于收集客户对产品或服务的满意度反馈，可根据实际情况修改题目。', 'PUBLISHED', TRUE, TRUE, 1),
('员工满意度调查问卷模板', '用于了解员工对公司工作环境、福利待遇、职业发展等方面的满意度。', 'PUBLISHED', TRUE, TRUE, 1),
('市场调研问卷模板', '用于调研消费者行为、偏好和需求，帮助企业制定市场策略。', 'PUBLISHED', TRUE, TRUE, 1);
