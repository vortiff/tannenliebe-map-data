-- Create table "locations"
CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    category TEXT,
    place_id TEXT UNIQUE,
    lat REAL,
    lng REAL,
    website TEXT,
    rating REAL,
    hours TEXT,
    updatedAt TEXT
);