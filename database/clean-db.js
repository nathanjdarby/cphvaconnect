#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

// Use the same database path as the app
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'cphva.db');
console.log('🧹 Cleaning database at:', dbPath);

const db = new Database(dbPath);

// Start transaction
const transaction = db.transaction(() => {
  console.log('\n🗑️  Removing duplicate data...');
  
  // Clear all tables (in correct order due to foreign keys)
  console.log('  - Clearing tickets...');
  db.prepare('DELETE FROM tickets').run();
  
  console.log('  - Clearing user votes...');
  db.prepare('DELETE FROM user_votes').run();
  
  console.log('  - Clearing poll options...');
  db.prepare('DELETE FROM poll_options').run();
  
  console.log('  - Clearing polls...');
  db.prepare('DELETE FROM polls').run();
  
  console.log('  - Clearing event speakers...');
  db.prepare('DELETE FROM event_speakers').run();
  
  console.log('  - Clearing schedule events...');
  db.prepare('DELETE FROM schedule_events').run();
  
  console.log('  - Clearing speakers...');
  db.prepare('DELETE FROM speakers').run();
  
  console.log('  - Clearing exhibitors...');
  db.prepare('DELETE FROM exhibitors').run();
  
  console.log('  - Clearing ticket types...');
  db.prepare('DELETE FROM ticket_types').run();
  
  console.log('  - Clearing locations...');
  db.prepare('DELETE FROM locations').run();
  
  console.log('  - Clearing users...');
  db.prepare('DELETE FROM users').run();
  
  console.log('  - Clearing app settings...');
  db.prepare('DELETE FROM app_settings').run();
  
  console.log('✅ Database cleared!');
});

// Execute the transaction
transaction();

console.log('\n🔄 Now re-initializing with clean data...');
console.log('Run: node init-db.js');

db.close();
