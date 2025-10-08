#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

// Use the same database path as the app
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'cphva.db');
console.log('🔍 Checking database at:', dbPath);

const db = new Database(dbPath);

console.log('\n📊 Current database contents:');

// Check speakers
const speakers = db.prepare('SELECT id, name, title FROM speakers').all();
console.log(`\n🎤 Speakers (${speakers.length}):`);
speakers.forEach((speaker, i) => {
  console.log(`  ${i + 1}. ${speaker.name} - ${speaker.title} (ID: ${speaker.id})`);
});

// Check schedule events
const events = db.prepare('SELECT id, title, start_time FROM schedule_events').all();
console.log(`\n📅 Schedule Events (${events.length}):`);
events.forEach((event, i) => {
  console.log(`  ${i + 1}. ${event.title} - ${event.start_time} (ID: ${event.id})`);
});

// Check users
const users = db.prepare('SELECT id, name, email, role FROM users').all();
console.log(`\n👥 Users (${users.length}):`);
users.forEach((user, i) => {
  console.log(`  ${i + 1}. ${user.name} (${user.email}) - ${user.role} (ID: ${user.id})`);
});

// Check exhibitors
const exhibitors = db.prepare('SELECT id, name FROM exhibitors').all();
console.log(`\n🏢 Exhibitors (${exhibitors.length}):`);
exhibitors.forEach((exhibitor, i) => {
  console.log(`  ${i + 1}. ${exhibitor.name} (ID: ${exhibitor.id})`);
});

// Check ticket types
const ticketTypes = db.prepare('SELECT id, name, price FROM ticket_types').all();
console.log(`\n🎫 Ticket Types (${ticketTypes.length}):`);
ticketTypes.forEach((tt, i) => {
  console.log(`  ${i + 1}. ${tt.name} - $${tt.price} (ID: ${tt.id})`);
});

console.log('\n🔧 To clean up duplicate data, run:');
console.log('   node clean-db.js');

db.close();
