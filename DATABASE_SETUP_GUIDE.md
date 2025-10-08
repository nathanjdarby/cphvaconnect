# 🗄️ CPHVA Connect Database Setup Guide

This guide will help you set up a persistent SQLite database for your CPHVA Connect application with sample data and user accounts.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Setup](#step-by-step-setup)
4. [Default Login Credentials](#default-login-credentials)
5. [Verification](#verification)
6. [Troubleshooting](#troubleshooting)
7. [Database Management](#database-management)

---

## 🎯 Overview

By default, your application uses mock data (in-memory) which resets on every restart. This guide will help you:

- ✅ Set up a persistent SQLite database
- ✅ Initialize it with sample data
- ✅ Create default user accounts
- ✅ Configure Docker volumes for data persistence

---

## 📦 Prerequisites

- ✅ Application deployed on your Ubuntu server
- ✅ Portainer running and accessible
- ✅ SSH access to your server
- ✅ Git repository updated with database files

---

## 🚀 Step-by-Step Setup

### Step 1: Update Your Git Repository

First, commit and push the database initialization script:

```bash
cd ~/Projects/cphvaconnect
git add database/init-db.js DATABASE_SETUP_GUIDE.md
git commit -m "Add database initialization script and setup guide"
git push origin main
```

### Step 2: Update Portainer Stack Configuration

1. Open Portainer at `https://10.2.250.64:9443/`
2. Navigate to **Stacks** → **cphvaconnect**
3. Click **Editor**
4. Replace the entire content with this updated configuration:

```yaml
services:
  app:
    image: node:20-alpine
    working_dir: /app
    command: sh -c "rm -rf * .[^.]* 2>/dev/null || true && apk add --no-cache git python3 make g++ && git clone --depth 1 https://github.com/nathanjdarby/cphvaconnect.git . && npm ci --legacy-peer-deps && npm run build && npm start"
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_TELEMETRY_DISABLED=1
      - DATABASE_PATH=/app/data/cphva.db
      - USE_REAL_DATABASE=true
    volumes:
      - app-data:/app/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    depends_on:
      - app
    restart: unless-stopped
    command: /bin/sh -c "echo 'events { worker_connections 1024; } http { upstream nextjs_upstream { server app:3000; } server { listen 80; server_name _; location / { proxy_pass http://nextjs_upstream; proxy_http_version 1.1; proxy_set_header Upgrade \$$http_upgrade; proxy_set_header Connection \"upgrade\"; proxy_set_header Host \$$host; proxy_set_header X-Real-IP \$$remote_addr; proxy_set_header X-Forwarded-For \$$proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto \$$scheme; proxy_cache_bypass \$$http_upgrade; } } }' > /etc/nginx/nginx.conf && nginx -g 'daemon off;'"

volumes:
  app-data:
    driver: local
```

5. Click **Update the stack**
6. Wait for the containers to restart (this may take 2-3 minutes)

### Step 3: Initialize the Database

Once the containers are running, SSH into your server and run:

```bash
# SSH into your server
ssh ndarby@10.2.250.64

# Enter the app container
docker exec -it cphvaconnect-app-1 sh

# Navigate to the database directory
cd /app/database

# Run the initialization script
node init-db.js

# Exit the container
exit
```

You should see output like this:

```
🚀 Initializing CPHVA Connect Database...
📁 Database path: /app/data/cphva.db
📋 Creating tables...
✅ Tables created successfully
👥 Inserting sample users...
✅ Users created
🎤 Inserting sample speakers...
✅ Speakers created
📍 Inserting locations...
✅ Locations created
📅 Inserting schedule events...
✅ Schedule events created
🏢 Inserting exhibitors...
✅ Exhibitors created
🎫 Inserting ticket types...
✅ Ticket types created
🎟️ Inserting sample tickets...
✅ Sample tickets created
📊 Inserting sample polls...
✅ Polls created
⚙️ Inserting app settings...
✅ App settings created

🎉 Database initialization complete!
```

### Step 4: Restart the Application

```bash
# Restart the app container to load the new database
docker restart cphvaconnect-app-1

# Wait about 30 seconds, then check if it's running
docker ps
```

---

## 🔐 Default Login Credentials

The database comes pre-populated with these user accounts:

### 👤 Admin Account
- **Email:** `admin@cphva.org`
- **Password:** `admin123`
- **Permissions:** Full access to all features

### 👤 Organiser Account
- **Email:** `organiser@cphva.org`
- **Password:** `organiser123`
- **Permissions:** Manage events, speakers, exhibitors, polls

### 👤 Staff Account
- **Email:** `staff@cphva.org`
- **Password:** `staff123`
- **Permissions:** Check-in attendees, view reports

### 👤 Attendee Account
- **Email:** `john@example.com`
- **Password:** `attendee123`
- **Permissions:** View schedule, vote in polls, view ticket

⚠️ **IMPORTANT:** Change these passwords immediately after first login!

---

## ✅ Verification

### Test the Database Setup

1. **Visit your application:** `http://10.2.250.64`

2. **Test Login:**
   - Go to `http://10.2.250.64/login`
   - Login with admin credentials
   - You should be redirected to the admin dashboard

3. **Check Sample Data:**
   - **Schedule:** `http://10.2.250.64/schedule` - Should show 4 events
   - **Speakers:** `http://10.2.250.64/speakers` - Should show 3 speakers
   - **Exhibitors:** `http://10.2.250.64/exhibitors` - Should show 3 exhibitors

4. **Test Admin Features:**
   - Navigate to Admin → Users (should show 4 users)
   - Navigate to Admin → Sales (should show 1 ticket)
   - Navigate to Admin → Polls (should show 2 polls)

5. **Test Data Persistence:**
   ```bash
   # Restart the container
   docker restart cphvaconnect-app-1
   
   # Wait 30 seconds, then check if data persists
   # Login again - your data should still be there!
   ```

---

## 🔧 Troubleshooting

### Issue: "Cannot find module 'better-sqlite3'"

**Solution:** The database initialization needs to run inside the container where dependencies are installed.

```bash
docker exec -it cphvaconnect-app-1 sh
cd /app/database
node init-db.js
exit
```

### Issue: "Database file already exists"

**Solution:** If you need to reinitialize the database:

```bash
docker exec -it cphvaconnect-app-1 sh
rm -f /app/data/cphva.db
cd /app/database
node init-db.js
exit
docker restart cphvaconnect-app-1
```

### Issue: "Still seeing mock data"

**Solution:** Check environment variables:

```bash
docker exec -it cphvaconnect-app-1 sh
echo $DATABASE_PATH
echo $USE_REAL_DATABASE
# Should output:
# /app/data/cphva.db
# true
exit
```

If not set correctly, update your Portainer stack configuration.

### Issue: "Login not working"

**Solution:** 

1. Check if database exists:
   ```bash
   docker exec -it cphvaconnect-app-1 ls -la /app/data/
   ```

2. Verify database has data:
   ```bash
   docker exec -it cphvaconnect-app-1 sh
   cd /app
   npx better-sqlite3 /app/data/cphva.db "SELECT * FROM users;"
   exit
   ```

3. Check app logs:
   ```bash
   docker logs cphvaconnect-app-1 --tail 50
   ```

### Issue: "Container won't start after update"

**Solution:**

```bash
# Check container logs
docker logs cphvaconnect-app-1 --tail 100

# If needed, roll back the stack in Portainer
# Then try the update again
```

---

## 📊 Database Management

### Backup Your Database

**Important:** Regular backups are essential!

```bash
# Create a backup
docker exec cphvaconnect-app-1 cp /app/data/cphva.db /app/data/cphva.db.backup

# Copy backup to host
docker cp cphvaconnect-app-1:/app/data/cphva.db.backup ~/cphva-backup-$(date +%Y%m%d).db

# Download to your local machine
scp ndarby@10.2.250.64:~/cphva-backup-*.db ~/Downloads/
```

### Restore from Backup

```bash
# Upload backup to server
scp ~/Downloads/cphva-backup-*.db ndarby@10.2.250.64:~/

# Copy to container
docker cp ~/cphva-backup-*.db cphvaconnect-app-1:/app/data/cphva.db

# Restart app
docker restart cphvaconnect-app-1
```

### View Database Contents

```bash
# Enter container
docker exec -it cphvaconnect-app-1 sh

# Use SQLite CLI
cd /app
npx better-sqlite3 /app/data/cphva.db

# Example queries:
.tables                                    # List all tables
SELECT * FROM users;                       # View all users
SELECT * FROM schedule_events;             # View all events
SELECT COUNT(*) FROM tickets;              # Count tickets
.exit                                      # Exit SQLite

exit  # Exit container
```

### Reset Database to Initial State

```bash
docker exec -it cphvaconnect-app-1 sh
rm -f /app/data/cphva.db
cd /app/database
node init-db.js
exit
docker restart cphvaconnect-app-1
```

---

## 🎯 What's Included in Sample Data

### Users (4)
- 1 Admin
- 1 Organiser
- 1 Staff member
- 1 Attendee (with 1 ticket)

### Speakers (3)
- Dr. Sarah Johnson (Featured)
- Prof. Michael Chen (Featured)
- Emma Williams

### Locations (4)
- Main Auditorium (500 capacity)
- Conference Room A (100 capacity)
- Conference Room B (50 capacity)
- Exhibition Hall (300 capacity)

### Schedule Events (4)
- Opening Keynote
- Digital Health Workshop
- Lunch Break
- Public Health Panel

### Exhibitors (3)
- MedTech Solutions
- Healthcare Analytics Co
- Wellness Products Ltd

### Ticket Types (4)
- Early Bird (£99.99)
- Standard (£149.99)
- VIP (£299.99)
- Student (£49.99)

### Polls (2)
- "What topic interests you most?" (4 options)
- "How did you hear about this conference?" (4 options)

---

## 🔒 Security Best Practices

### 1. Change Default Passwords

After first login, immediately change all default passwords:

1. Login as admin
2. Go to Admin → Users
3. For each user, update their password
4. Use strong, unique passwords

### 2. Disable Unused Accounts

If you don't need all sample accounts:

1. Go to Admin → Users
2. Delete unnecessary accounts
3. Keep only the accounts you need

### 3. Regular Backups

Set up a backup schedule:

```bash
# Create a backup script
cat > ~/backup-cphva.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d-%H%M%S)
docker exec cphvaconnect-app-1 cp /app/data/cphva.db /app/data/cphva.db.backup
docker cp cphvaconnect-app-1:/app/data/cphva.db.backup ~/backups/cphva-$DATE.db
# Keep only last 7 days of backups
find ~/backups/cphva-*.db -mtime +7 -delete
EOF

chmod +x ~/backup-cphva.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add this line:
# 0 2 * * * /home/ndarby/backup-cphva.sh
```

### 4. Monitor Database Size

```bash
# Check database size
docker exec cphvaconnect-app-1 du -h /app/data/cphva.db
```

---

## 📞 Need Help?

If you encounter any issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review container logs: `docker logs cphvaconnect-app-1`
3. Verify database exists: `docker exec cphvaconnect-app-1 ls -la /app/data/`
4. Check Portainer stack configuration

---

## 🎉 Success!

Once setup is complete, you'll have:

✅ Persistent database that survives container restarts
✅ Sample data to explore all features
✅ Multiple user accounts with different permission levels
✅ Ready-to-use conference data (events, speakers, exhibitors)
✅ Active polls with sample votes
✅ Ticket types and sample tickets

**Your CPHVA Connect application is now fully functional with a real database!**

---

## 📝 Next Steps

1. **Customize the data:**
   - Update speaker information
   - Modify event schedule
   - Add your exhibitors
   - Adjust ticket prices

2. **Configure settings:**
   - Go to Admin → Settings
   - Enable/disable ticket sales
   - Configure registration options

3. **Add real users:**
   - Create accounts for your team
   - Assign appropriate roles
   - Delete sample accounts if not needed

4. **Test all features:**
   - Create a poll
   - Check-in a ticket
   - Generate sales reports
   - Export data

Enjoy your fully functional conference management system! 🚀
