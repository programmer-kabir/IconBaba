CREATE DATABASE IF NOT EXISTS iconbaba;
USE iconbaba;

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS icons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INT,
    pack_id INT,
    svg_code TEXT,
    style_type VARCHAR(50),
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS icon_pack (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS icon_tags (
    icon_id INT,
    tag_id INT,
    PRIMARY KEY (icon_id, tag_id),
    FOREIGN KEY (icon_id) REFERENCES icons(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Insert some default data for testing
INSERT INTO categories (name, slug) VALUES 
('Basic Miscellany', 'basic-miscellany'),
('Interface', 'interface');

INSERT INTO tags (name) VALUES ('lovely'), ('heart'), ('love'), ('romantic');
