-- Create table "locations"
CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    category TEXT,
    place_id TEXT UNIQUE,
    photo TEXT,
    latitude REAL,
    longitude REAL,
    website TEXT,
    rating REAL,
    opening_hours TEXT,
    updatedAt TEXT
);