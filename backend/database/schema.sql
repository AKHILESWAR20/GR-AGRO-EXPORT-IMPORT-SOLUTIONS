-- ─────────────────────────────────────────
-- FILE: database/schema.sql
-- SECTION: PostgreSQL Schema
-- Run this in Railway's Query tab
-- ─────────────────────────────────────────

-- TABLE 1: USERS
CREATE TABLE IF NOT EXISTS users (
  user_id    SERIAL PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL,
  email      VARCHAR(150)  NOT NULL UNIQUE,
  password   VARCHAR(255)  NOT NULL,
  phone      VARCHAR(20),
  company    VARCHAR(150),
  role       VARCHAR(10)   DEFAULT 'client' CHECK (role IN ('client','admin')),
  created_at TIMESTAMP     DEFAULT NOW()
);

-- TABLE 2: PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  product_id     SERIAL PRIMARY KEY,
  name           VARCHAR(200) NOT NULL,
  category       VARCHAR(100) NOT NULL,
  description    TEXT,
  price          NUMERIC(12,2) NOT NULL,
  unit           VARCHAR(50),
  origin_country VARCHAR(100),
  stock_status   VARCHAR(30)  DEFAULT 'Available',
  image_url      VARCHAR(500),
  created_at     TIMESTAMP    DEFAULT NOW()
);

-- TABLE 3: INQUIRIES
CREATE TABLE IF NOT EXISTS inquiries (
  inquiry_id SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL,
  service    VARCHAR(100),
  message    TEXT         NOT NULL,
  created_at TIMESTAMP    DEFAULT NOW()
);

-- TABLE 4: ORDERS
CREATE TABLE IF NOT EXISTS orders (
  order_id    SERIAL PRIMARY KEY,
  client_id   INTEGER      NOT NULL REFERENCES users(user_id),
  product_id  INTEGER      NOT NULL REFERENCES products(product_id),
  quantity    INTEGER      NOT NULL,
  total_price NUMERIC(14,2),
  notes       TEXT,
  status      VARCHAR(30)  DEFAULT 'Processing',
  created_at  TIMESTAMP    DEFAULT NOW()
);

-- TABLE 5: SHIPMENTS
CREATE TABLE IF NOT EXISTS shipments (
  shipment_id        SERIAL PRIMARY KEY,
  order_id           INTEGER      NOT NULL REFERENCES orders(order_id),
  tracking_id        VARCHAR(100) NOT NULL UNIQUE,
  carrier            VARCHAR(100),
  origin             VARCHAR(200),
  destination        VARCHAR(200),
  status             VARCHAR(50)  DEFAULT 'In Transit',
  estimated_delivery DATE,
  created_at         TIMESTAMP    DEFAULT NOW()
);

-- TABLE 6: DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
  doc_id      SERIAL PRIMARY KEY,
  order_id    INTEGER      REFERENCES orders(order_id),
  file_name   VARCHAR(255) NOT NULL,
  file_url    VARCHAR(500) NOT NULL,
  file_size   INTEGER,
  doc_type    VARCHAR(100) DEFAULT 'General',
  uploaded_by INTEGER      REFERENCES users(user_id),
  created_at  TIMESTAMP    DEFAULT NOW()
);
