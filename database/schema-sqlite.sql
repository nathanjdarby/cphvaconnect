-- CPHVA Connect Database Schema (SQLite Version)
-- Converted from Firebase Firestore to SQLite

-- Users table (replaces Firebase Auth + Firestore users collection)
CREATE TABLE users (
    id TEXT PRIMARY KEY, -- Firebase Auth UID
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('attendee', 'admin', 'organiser')),
    name_is_public INTEGER DEFAULT 0, -- SQLite boolean as integer
    email_is_public INTEGER DEFAULT 0, -- SQLite boolean as integer
    bio TEXT,
    avatar_url TEXT,
    avatar_storage_path TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Ticket Types table
CREATE TABLE ticket_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Locations table
CREATE TABLE locations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Speakers table
CREATE TABLE speakers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    bio TEXT,
    image_url TEXT,
    image_storage_path TEXT,
    data_ai_hint TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Exhibitors table
CREATE TABLE exhibitors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    logo_storage_path TEXT,
    website_url TEXT,
    booth_number TEXT,
    data_ai_hint TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Schedule Events table
CREATE TABLE schedule_events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    location_id TEXT,
    offer_downloads INTEGER DEFAULT 0, -- SQLite boolean as integer
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
);

-- Event Files table (for schedule events)
CREATE TABLE event_files (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- MIME type
    size INTEGER NOT NULL,
    storage_url TEXT,
    storage_path TEXT,
    category TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES schedule_events(id) ON DELETE CASCADE
);

-- Event Speakers junction table (many-to-many relationship)
CREATE TABLE event_speakers (
    event_id TEXT NOT NULL,
    speaker_id TEXT NOT NULL,
    PRIMARY KEY (event_id, speaker_id),
    FOREIGN KEY (event_id) REFERENCES schedule_events(id) ON DELETE CASCADE,
    FOREIGN KEY (speaker_id) REFERENCES speakers(id) ON DELETE CASCADE
);

-- Tickets table
CREATE TABLE tickets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    conference_name TEXT NOT NULL,
    ticket_type TEXT NOT NULL,
    ticket_price REAL,
    purchase_date TEXT NOT NULL,
    qr_code_value TEXT UNIQUE NOT NULL,
    is_checked_in INTEGER DEFAULT 0, -- SQLite boolean as integer
    check_in_timestamp TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Polls table
CREATE TABLE polls (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    is_open INTEGER DEFAULT 1, -- SQLite boolean as integer
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Poll Options table
CREATE TABLE poll_options (
    id TEXT PRIMARY KEY,
    poll_id TEXT NOT NULL,
    text TEXT NOT NULL,
    votes INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
);

-- User Votes table
CREATE TABLE user_votes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    poll_id TEXT NOT NULL,
    option_id TEXT NOT NULL,
    voted_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES poll_options(id) ON DELETE CASCADE,
    UNIQUE(user_id, poll_id) -- One vote per user per poll
);

-- App Settings table
CREATE TABLE app_settings (
    id TEXT PRIMARY KEY DEFAULT 'settings',
    title TEXT NOT NULL,
    ticket_sales_enabled INTEGER DEFAULT 1, -- SQLite boolean as integer
    background_color TEXT,
    foreground_color TEXT,
    primary_color TEXT,
    accent_color TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_qr_code ON tickets(qr_code_value);
CREATE INDEX idx_schedule_events_start_time ON schedule_events(start_time);
CREATE INDEX idx_schedule_events_location_id ON schedule_events(location_id);
CREATE INDEX idx_event_speakers_event_id ON event_speakers(event_id);
CREATE INDEX idx_event_speakers_speaker_id ON event_speakers(speaker_id);
CREATE INDEX idx_user_votes_user_id ON user_votes(user_id);
CREATE INDEX idx_user_votes_poll_id ON user_votes(poll_id);
CREATE INDEX idx_poll_options_poll_id ON poll_options(poll_id);
CREATE INDEX idx_event_files_event_id ON event_files(event_id);
