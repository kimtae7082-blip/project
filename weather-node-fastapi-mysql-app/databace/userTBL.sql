DROP DATABASE IF EXISTS gmarketDB;

CREATE DATABASE gmarketDB;

USE gmarketDB;

CREATE TABLE userTBL (
    userID VARCHAR(20) NOT NULL PRIMARY KEY,
    password VARCHAR(15) NOT NULL,
    name VARCHAR(10),
    gender ENUM('Female', 'Male') NOT NULL,
    phoneNumber VARCHAR(11),
    email VARCHAR(40),
    address VARCHAR(100)
);

SHOW TABLES;

DESC userTBL;

INSERT INTO userTBL
(userID, password, name, gender, phoneNumber, email, address)
VALUES
('dino', 'starEarth', '홍길동', 'Male',
 '01012345678', 'ysboo2@naver.com', '경기도 안산시 사동'),

('tree', 'starMars', '이순신', 'Male',
 '01098546358', 'sea@naver.com', '여수시 오동도로 61'),

('sun', 'starSun', '임꺽정', 'Male',
 '01089982577', 'Earth4@naver.com', '서울시 강남구 영동대로 513');

SELECT * FROM userTBL;