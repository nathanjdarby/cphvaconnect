#!/usr/bin/env node

/**
 * Database Initialization Script for CPHVA Connect
 * This script creates the SQLite database with sample data
 */

const Database = require("better-sqlite3");
const path = require("path");
const crypto = require("crypto");

// Database path
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, "cphva.db");

console.log("🚀 Initializing CPHVA Connect Database...");
console.log(`📁 Database path: ${DB_PATH}`);

// Create database connection
const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma("foreign_keys = ON");

console.log("📋 Creating tables...");

// Create tables
db.exec(`
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'organiser', 'staff', 'attendee')),
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Speakers table
  CREATE TABLE IF NOT EXISTS speakers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT,
    bio TEXT,
    photoUrl TEXT,
    company TEXT,
    linkedIn TEXT,
    twitter TEXT,
    website TEXT,
    isFeatured INTEGER DEFAULT 0
  );

  -- Locations table
  CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    capacity INTEGER,
    description TEXT
  );

  -- Schedule Events table
  CREATE TABLE IF NOT EXISTS schedule_events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    startTime TEXT NOT NULL,
    endTime TEXT NOT NULL,
    locationId TEXT,
    eventType TEXT CHECK(eventType IN ('session', 'workshop', 'keynote', 'break', 'lunch', 'networking')),
    FOREIGN KEY (locationId) REFERENCES locations(id)
  );

  -- Event Speakers junction table
  CREATE TABLE IF NOT EXISTS event_speakers (
    eventId TEXT NOT NULL,
    speakerId TEXT NOT NULL,
    PRIMARY KEY (eventId, speakerId),
    FOREIGN KEY (eventId) REFERENCES schedule_events(id) ON DELETE CASCADE,
    FOREIGN KEY (speakerId) REFERENCES speakers(id) ON DELETE CASCADE
  );

  -- Event Files table
  CREATE TABLE IF NOT EXISTS event_files (
    id TEXT PRIMARY KEY,
    eventId TEXT NOT NULL,
    fileName TEXT NOT NULL,
    fileUrl TEXT NOT NULL,
    fileType TEXT,
    uploadedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (eventId) REFERENCES schedule_events(id) ON DELETE CASCADE
  );

  -- Exhibitors table
  CREATE TABLE IF NOT EXISTS exhibitors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    logoUrl TEXT,
    websiteUrl TEXT,
    boothNumber TEXT
  );

  -- Ticket Types table
  CREATE TABLE IF NOT EXISTS ticket_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    availableQuantity INTEGER
  );

  -- Tickets table
  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    ticketTypeId TEXT NOT NULL,
    qrCodeValue TEXT UNIQUE NOT NULL,
    purchaseDate TEXT NOT NULL,
    isCheckedIn INTEGER DEFAULT 0,
    checkInTimestamp TEXT,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (ticketTypeId) REFERENCES ticket_types(id)
  );

  -- Polls table
  CREATE TABLE IF NOT EXISTS polls (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    isOpen INTEGER DEFAULT 1
  );

  -- Poll Options table
  CREATE TABLE IF NOT EXISTS poll_options (
    id TEXT PRIMARY KEY,
    pollId TEXT NOT NULL,
    text TEXT NOT NULL,
    votes INTEGER DEFAULT 0,
    FOREIGN KEY (pollId) REFERENCES polls(id) ON DELETE CASCADE
  );

  -- App Settings table
  CREATE TABLE IF NOT EXISTS app_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    ticketSalesEnabled INTEGER DEFAULT 1,
    registrationEnabled INTEGER DEFAULT 1
  );
`);

console.log("✅ Tables created successfully");

// Helper function to generate UUID
function generateId() {
  return crypto.randomUUID();
}

// Helper function to hash password (simple for demo - use bcrypt in production)
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

console.log("👥 Inserting sample users...");

// Insert users
const users = [
  {
    id: generateId(),
    name: "Admin User",
    email: "admin@cphva.org",
    password: hashPassword("admin123"),
    role: "admin",
  },
  {
    id: generateId(),
    name: "Event Organiser",
    email: "organiser@cphva.org",
    password: hashPassword("organiser123"),
    role: "organiser",
  },
  {
    id: generateId(),
    name: "Staff Member",
    email: "staff@cphva.org",
    password: hashPassword("staff123"),
    role: "staff",
  },
  {
    id: generateId(),
    name: "John Attendee",
    email: "john@example.com",
    password: hashPassword("attendee123"),
    role: "attendee",
  },
];

const insertUser = db.prepare(
  "INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)"
);
users.forEach((user) => {
  insertUser.run(user.id, user.name, user.email, user.password, user.role);
});

console.log("✅ Users created");

console.log("🎤 Inserting sample speakers...");

// Insert speakers
const speakers = [
  {
    id: generateId(),
    name: "Dr. Sarah Johnson",
    title: "Chief Medical Officer",
    bio: "Dr. Johnson has over 20 years of experience in healthcare leadership and innovation.",
    photoUrl: "https://placehold.co/400x400.png?text=SJ",
    company: "Healthcare Innovations Ltd",
    linkedIn: "https://linkedin.com/in/sarahjohnson",
    isFeatured: 1,
  },
  {
    id: generateId(),
    name: "Prof. Michael Chen",
    title: "Professor of Public Health",
    bio: "Professor Chen specializes in epidemiology and public health policy.",
    photoUrl: "https://placehold.co/400x400.png?text=MC",
    company: "University of Health Sciences",
    twitter: "@profchen",
    isFeatured: 1,
  },
  {
    id: generateId(),
    name: "Emma Williams",
    title: "Healthcare Technology Consultant",
    bio: "Emma helps healthcare organizations implement digital transformation strategies.",
    photoUrl: "https://placehold.co/400x400.png?text=EW",
    company: "TechHealth Consulting",
    website: "https://techhealthconsulting.com",
    isFeatured: 0,
  },
];

const insertSpeaker = db.prepare(
  "INSERT INTO speakers (id, name, title, bio, photoUrl, company, linkedIn, twitter, website, isFeatured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
);
speakers.forEach((speaker) => {
  insertSpeaker.run(
    speaker.id,
    speaker.name,
    speaker.title,
    speaker.bio,
    speaker.photoUrl,
    speaker.company,
    speaker.linkedIn || null,
    speaker.twitter || null,
    speaker.website || null,
    speaker.isFeatured
  );
});

console.log("✅ Speakers created");

console.log("📍 Inserting locations...");

// Insert locations
const locations = [
  {
    id: generateId(),
    name: "Main Auditorium",
    capacity: 500,
    description: "Large auditorium for keynote sessions",
  },
  {
    id: generateId(),
    name: "Conference Room A",
    capacity: 100,
    description: "Medium-sized room for workshops",
  },
  {
    id: generateId(),
    name: "Conference Room B",
    capacity: 50,
    description: "Smaller room for breakout sessions",
  },
  {
    id: generateId(),
    name: "Exhibition Hall",
    capacity: 300,
    description: "Large space for exhibitors and networking",
  },
];

const insertLocation = db.prepare(
  "INSERT INTO locations (id, name, capacity, description) VALUES (?, ?, ?, ?)"
);
locations.forEach((location) => {
  insertLocation.run(
    location.id,
    location.name,
    location.capacity,
    location.description
  );
});

console.log("✅ Locations created");

console.log("📅 Inserting schedule events...");

// Insert schedule events (using tomorrow's date)
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const dateStr = tomorrow.toISOString().split("T")[0];

const events = [
  {
    id: generateId(),
    title: "Opening Keynote: Future of Healthcare",
    description:
      "Join us for an inspiring keynote on the future of healthcare delivery.",
    startTime: `${dateStr}T09:00:00Z`,
    endTime: `${dateStr}T10:00:00Z`,
    locationId: locations[0].id,
    eventType: "keynote",
    speakerIds: [speakers[0].id],
  },
  {
    id: generateId(),
    title: "Workshop: Digital Health Technologies",
    description: "Hands-on workshop exploring the latest digital health tools.",
    startTime: `${dateStr}T10:30:00Z`,
    endTime: `${dateStr}T12:00:00Z`,
    locationId: locations[1].id,
    eventType: "workshop",
    speakerIds: [speakers[2].id],
  },
  {
    id: generateId(),
    title: "Lunch Break",
    description: "Networking lunch in the exhibition hall.",
    startTime: `${dateStr}T12:00:00Z`,
    endTime: `${dateStr}T13:00:00Z`,
    locationId: locations[3].id,
    eventType: "lunch",
    speakerIds: [],
  },
  {
    id: generateId(),
    title: "Panel: Public Health Challenges",
    description: "Expert panel discussing current public health challenges.",
    startTime: `${dateStr}T13:00:00Z`,
    endTime: `${dateStr}T14:30:00Z`,
    locationId: locations[0].id,
    eventType: "session",
    speakerIds: [speakers[1].id, speakers[0].id],
  },
];

const insertEvent = db.prepare(
  "INSERT INTO schedule_events (id, title, description, startTime, endTime, locationId, eventType) VALUES (?, ?, ?, ?, ?, ?, ?)"
);
const insertEventSpeaker = db.prepare(
  "INSERT INTO event_speakers (eventId, speakerId) VALUES (?, ?)"
);

events.forEach((event) => {
  insertEvent.run(
    event.id,
    event.title,
    event.description,
    event.startTime,
    event.endTime,
    event.locationId,
    event.eventType
  );
  event.speakerIds.forEach((speakerId) => {
    insertEventSpeaker.run(event.id, speakerId);
  });
});

console.log("✅ Schedule events created");

console.log("🏢 Inserting exhibitors...");

// Insert exhibitors
const exhibitors = [
  {
    id: generateId(),
    name: "MedTech Solutions",
    description: "Leading provider of medical technology and equipment.",
    logoUrl: "https://placehold.co/400x225.png?text=MedTech",
    websiteUrl: "https://medtechsolutions.com",
    boothNumber: "A1",
  },
  {
    id: generateId(),
    name: "Healthcare Analytics Co",
    description: "Data analytics and insights for healthcare organizations.",
    logoUrl: "https://placehold.co/400x225.png?text=Analytics",
    websiteUrl: "https://healthcareanalytics.com",
    boothNumber: "A2",
  },
  {
    id: generateId(),
    name: "Wellness Products Ltd",
    description: "Innovative wellness and preventive care products.",
    logoUrl: "https://placehold.co/400x225.png?text=Wellness",
    websiteUrl: "https://wellnessproducts.com",
    boothNumber: "B1",
  },
];

const insertExhibitor = db.prepare(
  "INSERT INTO exhibitors (id, name, description, logoUrl, websiteUrl, boothNumber) VALUES (?, ?, ?, ?, ?, ?)"
);
exhibitors.forEach((exhibitor) => {
  insertExhibitor.run(
    exhibitor.id,
    exhibitor.name,
    exhibitor.description,
    exhibitor.logoUrl,
    exhibitor.websiteUrl,
    exhibitor.boothNumber
  );
});

console.log("✅ Exhibitors created");

console.log("🎫 Inserting ticket types...");

// Insert ticket types
const ticketTypes = [
  {
    id: generateId(),
    name: "Early Bird",
    price: 99.99,
    description: "Early bird special pricing",
    availableQuantity: 50,
  },
  {
    id: generateId(),
    name: "Standard",
    price: 149.99,
    description: "Standard admission ticket",
    availableQuantity: 200,
  },
  {
    id: generateId(),
    name: "VIP",
    price: 299.99,
    description: "VIP access with exclusive benefits",
    availableQuantity: 25,
  },
  {
    id: generateId(),
    name: "Student",
    price: 49.99,
    description: "Discounted student rate",
    availableQuantity: 100,
  },
];

const insertTicketType = db.prepare(
  "INSERT INTO ticket_types (id, name, price, description, availableQuantity) VALUES (?, ?, ?, ?, ?)"
);
ticketTypes.forEach((type) => {
  insertTicketType.run(
    type.id,
    type.name,
    type.price,
    type.description,
    type.availableQuantity
  );
});

console.log("✅ Ticket types created");

console.log("🎟️ Inserting sample tickets...");

// Insert sample tickets for the attendee
const tickets = [
  {
    id: generateId(),
    userId: users[3].id, // John Attendee
    ticketTypeId: ticketTypes[1].id, // Standard ticket
    qrCodeValue: `TICKET-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`,
    purchaseDate: new Date().toISOString(),
    isCheckedIn: 0,
  },
];

const insertTicket = db.prepare(
  "INSERT INTO tickets (id, userId, ticketTypeId, qrCodeValue, purchaseDate, isCheckedIn) VALUES (?, ?, ?, ?, ?, ?)"
);
tickets.forEach((ticket) => {
  insertTicket.run(
    ticket.id,
    ticket.userId,
    ticket.ticketTypeId,
    ticket.qrCodeValue,
    ticket.purchaseDate,
    ticket.isCheckedIn
  );
});

console.log("✅ Sample tickets created");

console.log("📊 Inserting sample polls...");

// Insert sample polls
const polls = [
  {
    id: generateId(),
    question: "What topic interests you most?",
    isOpen: 1,
    options: [
      { id: generateId(), text: "Digital Health", votes: 15 },
      { id: generateId(), text: "Public Health Policy", votes: 8 },
      { id: generateId(), text: "Healthcare Innovation", votes: 22 },
      { id: generateId(), text: "Patient Care", votes: 12 },
    ],
  },
  {
    id: generateId(),
    question: "How did you hear about this conference?",
    isOpen: 1,
    options: [
      { id: generateId(), text: "Social Media", votes: 25 },
      { id: generateId(), text: "Email Newsletter", votes: 18 },
      { id: generateId(), text: "Colleague Recommendation", votes: 30 },
      { id: generateId(), text: "Website", votes: 10 },
    ],
  },
];

const insertPoll = db.prepare(
  "INSERT INTO polls (id, question, isOpen) VALUES (?, ?, ?)"
);
const insertPollOption = db.prepare(
  "INSERT INTO poll_options (id, pollId, text, votes) VALUES (?, ?, ?, ?)"
);

polls.forEach((poll) => {
  insertPoll.run(poll.id, poll.question, poll.isOpen);
  poll.options.forEach((option) => {
    insertPollOption.run(option.id, poll.id, option.text, option.votes);
  });
});

console.log("✅ Polls created");

console.log("⚙️ Inserting app settings...");

// Insert app settings
db.prepare(
  "INSERT INTO app_settings (id, ticketSalesEnabled, registrationEnabled) VALUES (1, 1, 1)"
).run();

console.log("✅ App settings created");

// Close database
db.close();

console.log("\n🎉 Database initialization complete!");
console.log("\n📝 Default Login Credentials:");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("👤 Admin:");
console.log("   Email: admin@cphva.org");
console.log("   Password: admin123");
console.log("\n👤 Organiser:");
console.log("   Email: organiser@cphva.org");
console.log("   Password: organiser123");
console.log("\n👤 Staff:");
console.log("   Email: staff@cphva.org");
console.log("   Password: staff123");
console.log("\n👤 Attendee:");
console.log("   Email: john@example.com");
console.log("   Password: attendee123");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("\n⚠️  IMPORTANT: Change these passwords in production!");
