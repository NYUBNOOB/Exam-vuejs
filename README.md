
# Banking website

This project is made for fullstack-test in Clicknext company.

# How to get start project

# Frontend 

    cd frontend 
    npm install
    npm install bootstrap
    npm install axios

# Backend

    cd backend
    npm install
    change name file .envexample

# Create database

    docker exec -it mysql-db mysql -uappuser -papppass testdb
    USE testdb;

    CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL UNIQE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    INSERT INTO users (email, password)
        VALUES ('test1@gmail.com', '1234');  

    CREATE TABLE transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        type ENUM('deposit','withdraw') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

# Docker

    docker-compose up --build -d
    docker-compose up -d

