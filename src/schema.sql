CREATE TABLE
    IF NOT EXISTS users (
        user_id PRIMARY KEY NOT NULL,
        username VARCHAR(255) NOT NULL,
        avatar VARCHAR(255) NOT NULL,
        banner VARCHAR(255) NOT NULL,
        bio TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        website VARCHAR(255) NOT NULL,
        joined_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS stats (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        followers INT NOT NULL,
        following INT NOT NULL,
        tweets INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );