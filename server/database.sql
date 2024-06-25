CREATE DATABASE events;

CREATE TABLE client (
    user_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE category (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(250) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE event (
    event_id SERIAL PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    event_description VARCHAR(255) NOT NULL,
    event_startdate TIMESTAMP NOT NULL,
    event_enddate TIMESTAMP NOT NULL,
    event_image TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    eventcategory_id INT,
    FOREIGN KEY (eventcategory_id) REFERENCES category(category_id)
);

CREATE TABLE package (
    package_id SERIAL PRIMARY KEY,
    package_name VARCHAR(255) NOT NULL,
    package_description VARCHAR(255),
    package_amount DECIMAL(10,2) NOT NULL;
    event_id INT,
    FOREIGN KEY (event_id) REFERENCES event(event_id)
);

CREATE TABLE booking (
    booking_id SERIAL PRIMARY KEY,
    booking_number INT NOT NULL,
    event_id INT,
    package_id INT,
    user_id INT,
    FOREIGN KEY (event_id) REFERENCES event(event_id),
    FOREIGN KEY (package_id) REFERENCES package(package_id),
    FOREIGN KEY (user_id) REFERENCES client(user_id)
);

