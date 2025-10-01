# CPHVA Connect Database Documentation

This directory contains the complete database schema documentation and tools for generating PDF reports.

## 📁 Files Overview

### Documentation Files

- **`SCHEMA_DOCUMENTATION.md`** - Complete database schema documentation in Markdown format
- **`CPHVA_Connect_Database_Schema.pdf`** - Generated PDF documentation (in `pdf/` folder)

### Database Files

- **`schema-sqlite.sql`** - Complete SQLite database schema
- **`seed-sqlite.sql`** - Initial data population scripts

### PDF Generation Tools

- **`generate_pdf.sh`** - Bash script for PDF generation (requires pandoc)
- **`generate_pdf.js`** - Node.js script for PDF generation (recommended)

## 🚀 Generating PDF Documentation

### Option 1: Node.js Script (Recommended)

```bash
# Install dependencies (if not already installed)
npm install --save-dev puppeteer marked

# Generate PDF
node database/generate_pdf.js
```

### Option 2: Bash Script (Alternative)

```bash
# Install pandoc (macOS)
brew install pandoc

# Install wkhtmltopdf for better formatting (optional)
brew install wkhtmltopdf

# Generate PDF
./database/generate_pdf.sh
```

## 📊 Database Schema Overview

The CPHVA Connect application uses a SQLite database with 10 main tables:

1. **users** - User accounts and profiles
2. **tickets** - Conference ticket management
3. **schedule_events** - Conference schedule and events
4. **speakers** - Speaker profiles and information
5. **exhibitors** - Exhibition booth management
6. **ticket_types** - Ticket pricing and categories
7. **locations** - Venue and room information
8. **polls** - Interactive polling system
9. **user_votes** - Poll voting records
10. **app_settings** - Application configuration

## 🔄 Migration from Firebase

This database schema was migrated from Firebase Firestore to SQLite for:

- Local development and testing
- Data analysis and reporting
- Offline capabilities
- Cost optimization

### Migration Features

- ✅ Preserved all data relationships
- ✅ Maintained data integrity
- ✅ Added proper indexing
- ✅ Implemented foreign key constraints
- ✅ Created comprehensive documentation

## 📋 Usage

### Viewing Documentation

- Open `SCHEMA_DOCUMENTATION.md` in any Markdown viewer
- Open `pdf/CPHVA_Connect_Database_Schema.pdf` for formatted PDF version

### Database Operations

```bash
# Initialize database
sqlite3 database/cphva_connect.db < database/schema-sqlite.sql

# Populate with sample data
sqlite3 database/cphva_connect.db < database/seed-sqlite.sql

# Export Firebase data (if needed)
node database/export-firebase-data.js
```

## 🛠️ Technical Details

### Database Engine

- **Type**: SQLite 3
- **File**: `database/cphva_connect.db`
- **Encoding**: UTF-8
- **Version**: 1.0

### PDF Generation

- **Engine**: Puppeteer (Node.js) or Pandoc (Bash)
- **Format**: A4 with professional styling
- **Features**: Table of contents, page numbers, proper formatting

### Dependencies

- **Node.js**: puppeteer, marked
- **System**: pandoc, wkhtmltopdf (optional)

## 📞 Support

For questions about the database schema or PDF generation:

1. Check the documentation files
2. Review the migration scripts
3. Contact the development team

---

_Generated on: January 2025_  
_CPHVA Connect Database Migration Project_
