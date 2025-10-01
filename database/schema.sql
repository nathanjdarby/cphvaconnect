-- CPHVA Connect Database Schema
-- Converted from Firebase Firestore to PostgreSQL/SQLite

-- Users table (replaces Firebase Auth + Firestore users collection)
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY, -- Firebase Auth UID
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('attendee', 'admin', 'organiser')),
    name_is_public BOOLEAN DEFAULT false,
    email_is_public BOOLEAN DEFAULT false,
    bio TEXT,
    avatar_url TEXT,
    avatar_storage_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ticket Types table
CREATE TABLE ticket_types (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Locations table
CREATE TABLE locations (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Speakers table
CREATE TABLE speakers (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    bio TEXT,
    image_url TEXT,
    image_storage_path TEXT,
    data_ai_hint TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exhibitors table
CREATE TABLE exhibitors (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url TEXT,
    logo_storage_path TEXT,
    website_url TEXT,
    booth_number VARCHAR(50),
    data_ai_hint TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schedule Events table
CREATE TABLE schedule_events (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location_id VARCHAR(255),
    offer_downloads BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
);

-- Event Files table (for schedule events)
CREATE TABLE event_files (
    id VARCHAR(255) PRIMARY KEY,
    event_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- MIME type
    size INTEGER NOT NULL,
    storage_url TEXT,
    storage_path TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES schedule_events(id) ON DELETE CASCADE
);

-- Event Speakers junction table (many-to-many relationship)
CREATE TABLE event_speakers (
    event_id VARCHAR(255) NOT NULL,
    speaker_id VARCHAR(255) NOT NULL,
    PRIMARY KEY (event_id, speaker_id),
    FOREIGN KEY (event_id) REFERENCES schedule_events(id) ON DELETE CASCADE,
    FOREIGN KEY (speaker_id) REFERENCES speakers(id) ON DELETE CASCADE
);

-- Tickets table
CREATE TABLE tickets (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    conference_name VARCHAR(255) NOT NULL,
    ticket_type VARCHAR(255) NOT NULL,
    ticket_price DECIMAL(10,2),
    purchase_date TIMESTAMP NOT NULL,
    qr_code_value VARCHAR(255) UNIQUE NOT NULL,
    is_checked_in BOOLEAN DEFAULT false,
    check_in_timestamp TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Polls table
CREATE TABLE polls (
    id VARCHAR(255) PRIMARY KEY,
    question TEXT NOT NULL,
    is_open BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Poll Options table
CREATE TABLE poll_options (
    id VARCHAR(255) PRIMARY KEY,
    poll_id VARCHAR(255) NOT NULL,
    text VARCHAR(255) NOT NULL,
    votes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
);

-- User Votes table
CREATE TABLE user_votes (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    poll_id VARCHAR(255) NOT NULL,
    option_id VARCHAR(255) NOT NULL,
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES poll_options(id) ON DELETE CASCADE,
    UNIQUE(user_id, poll_id) -- One vote per user per poll
);

-- App Settings table
CREATE TABLE app_settings (
    id VARCHAR(255) PRIMARY KEY DEFAULT 'settings',
    title VARCHAR(255) NOT NULL,
    ticket_sales_enabled BOOLEAN DEFAULT true,
    background_color VARCHAR(50),
    foreground_color VARCHAR(50),
    primary_color VARCHAR(50),
    accent_color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ticket_types_updated_at BEFORE UPDATE ON ticket_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_speakers_updated_at BEFORE UPDATE ON speakers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exhibitors_updated_at BEFORE UPDATE ON exhibitors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schedule_events_updated_at BEFORE UPDATE ON schedule_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_polls_updated_at BEFORE UPDATE ON polls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_poll_options_updated_at BEFORE UPDATE ON poll_options FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
