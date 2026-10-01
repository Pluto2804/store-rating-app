CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(60) NOT NULL
        CHECK (char_length(name) BETWEEN 20 AND 60),

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    address VARCHAR(400) NOT NULL,

    role VARCHAR(10) NOT NULL
        CHECK (role IN ('admin', 'user', 'owner')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE stores (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(255) NOT NULL,

    email VARCHAR(255) NOT NULL,

    address VARCHAR(400) NOT NULL,

    owner_id BIGINT NOT NULL
        REFERENCES users(id)
        ON DELETE RESTRICT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (owner_id)
);


CREATE TABLE ratings (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    store_id BIGINT NOT NULL
        REFERENCES stores(id)
        ON DELETE CASCADE,

    rating SMALLINT NOT NULL
        CHECK (rating BETWEEN 1 AND 5),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (user_id, store_id)
);


CREATE INDEX idx_ratings_store_id
    ON ratings(store_id);
