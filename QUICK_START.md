# 🚀 CPHVA Connect - Quick Start Guide

## 📋 TL;DR - Get Database Running in 5 Minutes

### Step 1: Update Portainer Stack (2 min)

Go to: `https://10.2.250.64:9443/` → Stacks → cphvaconnect → Editor

**Paste this:**

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

Click **Update the stack** → Wait 2-3 minutes

### Step 2: Initialize Database (2 min)

```bash
# SSH to server
ssh ndarby@10.2.250.64

# Run these commands
docker exec -it cphvaconnect-app-1 sh -c "cd /app/database && node init-db.js"
docker restart cphvaconnect-app-1

# Wait 30 seconds
sleep 30

# Check it's running
docker ps
```

### Step 3: Login (1 min)

Go to: `http://10.2.250.64/login`

**Admin Login:**
- Email: `admin@cphva.org`
- Password: `admin123`

✅ **Done!** You now have a fully functional app with persistent data!

---

## 🔐 All Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@cphva.org | admin123 |
| Organiser | organiser@cphva.org | organiser123 |
| Staff | staff@cphva.org | staff123 |
| Attendee | john@example.com | attendee123 |

⚠️ **Change these passwords immediately!**

---

## 🎯 What You Get

✅ **4 Users** - Admin, Organiser, Staff, Attendee
✅ **3 Speakers** - With bios and photos
✅ **4 Locations** - Auditorium, conference rooms, exhibition hall
✅ **4 Events** - Scheduled for tomorrow
✅ **3 Exhibitors** - With booth numbers
✅ **4 Ticket Types** - Early Bird, Standard, VIP, Student
✅ **2 Active Polls** - With sample votes
✅ **1 Sample Ticket** - For the attendee user

---

## 🔧 Common Commands

### Check if containers are running
```bash
docker ps
```

### View app logs
```bash
docker logs cphvaconnect-app-1 -f
```

### Restart the app
```bash
docker restart cphvaconnect-app-1
```

### Backup database
```bash
docker cp cphvaconnect-app-1:/app/data/cphva.db ~/cphva-backup-$(date +%Y%m%d).db
```

### Reset database (start fresh)
```bash
docker exec -it cphvaconnect-app-1 sh -c "rm -f /app/data/cphva.db && cd /app/database && node init-db.js"
docker restart cphvaconnect-app-1
```

---

## 🌐 Important URLs

- **Home:** http://10.2.250.64
- **Login:** http://10.2.250.64/login
- **Schedule:** http://10.2.250.64/schedule
- **Speakers:** http://10.2.250.64/speakers
- **Exhibitors:** http://10.2.250.64/exhibitors
- **Admin Dashboard:** http://10.2.250.64/admin
- **Portainer:** https://10.2.250.64:9443

---

## ❓ Troubleshooting

### Problem: Can't login
```bash
# Check if database exists
docker exec cphvaconnect-app-1 ls -la /app/data/cphva.db

# If not, initialize it
docker exec -it cphvaconnect-app-1 sh -c "cd /app/database && node init-db.js"
docker restart cphvaconnect-app-1
```

### Problem: Still seeing mock data
```bash
# Check environment variables
docker exec cphvaconnect-app-1 env | grep DATABASE

# Should see:
# DATABASE_PATH=/app/data/cphva.db
# USE_REAL_DATABASE=true
```

### Problem: Container won't start
```bash
# Check logs
docker logs cphvaconnect-app-1 --tail 100

# Restart stack in Portainer
```

---

## 📚 Full Documentation

For detailed information, see:
- **DATABASE_SETUP_GUIDE.md** - Complete setup instructions
- **DEPLOYMENT_GUIDE.md** - Original deployment guide
- **README.md** - Project overview

---

## 🎉 You're All Set!

Your CPHVA Connect application is now running with:
- ✅ Persistent database
- ✅ Sample data
- ✅ Multiple user accounts
- ✅ Full functionality

**Next:** Login and start customizing your conference data!

---

**Need help?** Check the logs: `docker logs cphvaconnect-app-1`
