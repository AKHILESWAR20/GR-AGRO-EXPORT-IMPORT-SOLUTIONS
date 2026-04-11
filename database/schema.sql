-- ─────────────────────────────────────────
-- FILE: database/schema.sql
-- SECTION: Oracle SQL Database Schema
-- Run this file in your Oracle SQL client
-- to create all required tables
-- ─────────────────────────────────────────


-- ── TABLE 1: USERS
-- Stores both Admin and Client accounts
CREATE TABLE USERS (
  USER_ID     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  NAME        VARCHAR2(100)  NOT NULL,
  EMAIL       VARCHAR2(150)  NOT NULL UNIQUE,
  PASSWORD    VARCHAR2(255)  NOT NULL,
  PHONE       VARCHAR2(20),
  COMPANY     VARCHAR2(150),
  ROLE        VARCHAR2(10)   DEFAULT 'client' CHECK (ROLE IN ('client','admin')),
  CREATED_AT  DATE           DEFAULT SYSDATE
);

-- ── TABLE 2: PRODUCTS
-- Product catalog managed by Admin
CREATE TABLE PRODUCTS (
  PRODUCT_ID      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  NAME            VARCHAR2(200)  NOT NULL,
  CATEGORY        VARCHAR2(100)  NOT NULL,
  DESCRIPTION     CLOB,
  PRICE           NUMBER(12,2)   NOT NULL,
  UNIT            VARCHAR2(50),
  ORIGIN_COUNTRY  VARCHAR2(100),
  STOCK_STATUS    VARCHAR2(30)   DEFAULT 'Available',
  IMAGE_URL       VARCHAR2(500),
  CREATED_AT      DATE           DEFAULT SYSDATE
);

-- ── TABLE 3: INQUIRIES
-- Contact form submissions
CREATE TABLE INQUIRIES (
  INQUIRY_ID  NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  NAME        VARCHAR2(100)  NOT NULL,
  EMAIL       VARCHAR2(150)  NOT NULL,
  SERVICE     VARCHAR2(100),
  MESSAGE     CLOB           NOT NULL,
  CREATED_AT  DATE           DEFAULT SYSDATE
);

-- ── TABLE 4: ORDERS
-- Orders placed by clients
CREATE TABLE ORDERS (
  ORDER_ID    NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  CLIENT_ID   NUMBER         NOT NULL REFERENCES USERS(USER_ID),
  PRODUCT_ID  NUMBER         NOT NULL REFERENCES PRODUCTS(PRODUCT_ID),
  QUANTITY    NUMBER         NOT NULL,
  TOTAL_PRICE NUMBER(14,2),
  NOTES       CLOB,
  STATUS      VARCHAR2(30)   DEFAULT 'Processing'
              CHECK (STATUS IN ('Processing','Confirmed','Shipped','Delivered','Cancelled')),
  CREATED_AT  DATE           DEFAULT SYSDATE
);

-- ── TABLE 5: SHIPMENTS
-- Shipment tracking per order
CREATE TABLE SHIPMENTS (
  SHIPMENT_ID        NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ORDER_ID           NUMBER        NOT NULL REFERENCES ORDERS(ORDER_ID),
  TRACKING_ID        VARCHAR2(100) NOT NULL UNIQUE,
  CARRIER            VARCHAR2(100),
  ORIGIN             VARCHAR2(200),
  DESTINATION        VARCHAR2(200),
  STATUS             VARCHAR2(50)  DEFAULT 'In Transit'
                     CHECK (STATUS IN ('Pending','In Transit','Out for Delivery','Delivered','On Hold','Returned')),
  ESTIMATED_DELIVERY DATE,
  CREATED_AT         DATE          DEFAULT SYSDATE
);

-- ── TABLE 6: DOCUMENTS
-- Uploaded files linked to orders
CREATE TABLE DOCUMENTS (
  DOC_ID       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ORDER_ID     NUMBER         REFERENCES ORDERS(ORDER_ID),
  FILE_NAME    VARCHAR2(255)  NOT NULL,
  FILE_URL     VARCHAR2(500)  NOT NULL,
  FILE_SIZE    NUMBER,
  DOC_TYPE     VARCHAR2(100)  DEFAULT 'General',
  UPLOADED_BY  NUMBER         REFERENCES USERS(USER_ID),
  CREATED_AT   DATE           DEFAULT SYSDATE
);


-- ─────────────────────────────────────────
-- DEFAULT ADMIN ACCOUNT SETUP
-- Run this ONCE after creating tables
-- Password below is: Admin@2025
-- Change it immediately after first login!
-- ─────────────────────────────────────────
-- NOTE: Generate the bcrypt hash from Node.js:
--   const bcrypt = require('bcryptjs');
--   bcrypt.hash('Admin@2025', 12).then(console.log);
-- Then replace the hash below:

INSERT INTO USERS (NAME, EMAIL, PASSWORD, ROLE)
VALUES (
  'Gopi Admin',
  'admin@gopiexportinghub.com',
  '$2a$12$REPLACE_THIS_WITH_BCRYPT_HASH',
  'admin'
);

COMMIT;
