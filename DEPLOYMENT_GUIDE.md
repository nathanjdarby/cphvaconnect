# CPHVA Connect - Linode Deployment Guide

This guide will walk you through deploying your CPHVA Connect application to Linode.

## Prerequisites

- Linode account
- Domain name (optional, but recommended)
- SSH access to your local machine

## Step 1: Create Linode Instance

1. **Log in to Linode**: Go to [cloud.linode.com](https://cloud.linode.com)

2. **Create a new Linode**:

   - **Distribution**: Ubuntu 22.04 LTS
   - **Plan**: Nanode 1GB (minimum) - upgrade as needed
   - **Region**: Choose closest to your users
   - **Root Password**: Create a strong password
   - **SSH Keys**: Add your SSH public key

3. **Note your server IP address** - you'll need this for deployment

## Step 2: Connect to Your Server

```bash
ssh root@YOUR_SERVER_IP
```

## Step 3: Run the Deployment Script

1. **Upload your project files** to the server. You can use `scp` or `rsync`:

```bash
# From your local machine, in the project directory
scp -r . root@YOUR_SERVER_IP:/opt/cphva-connect/
```

2. **Run the deployment script** on the server:

```bash
cd /opt/cphva-connect
chmod +x deploy.sh
./deploy.sh
```

## Step 4: Start Your Application

```bash
cd /opt/cphva-connect
docker-compose up -d
```

## Step 5: Configure Domain and SSL (Recommended)

1. **Point your domain** to your Linode server IP
2. **Get SSL certificate**:

```bash
certbot --nginx -d yourdomain.com
```

3. **Update nginx.conf** with your domain:

```bash
# Edit the server_name in nginx.conf
nano nginx.conf
# Change "server_name _;" to "server_name yourdomain.com;"
```

4. **Restart services**:

```bash
docker-compose restart
```

## Step 6: Verify Deployment

1. **Check application status**:

```bash
docker-compose ps
```

2. **View logs**:

```bash
docker-compose logs -f app
```

3. **Test health endpoint**:

```bash
curl http://YOUR_SERVER_IP/api/health
```

4. **Visit your application**:
   - HTTP: `http://YOUR_SERVER_IP`
   - HTTPS: `https://YOUR_SERVER_IP` (or your domain)

## Maintenance Commands

### Update Application

```bash
cd /opt/cphva-connect
git pull  # if using git
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### View Logs

```bash
docker-compose logs -f app
```

### Backup Database

```bash
cp /opt/cphva-connect/database/cphva_connect.db /opt/cphva-connect/backup-$(date +%Y%m%d).db
```

### Restart Services

```bash
docker-compose restart
```

## Security Considerations

1. **Firewall**: Configure UFW to only allow necessary ports

```bash
ufw allow ssh
ufw allow 80
ufw allow 443
ufw enable
```

2. **Regular Updates**: Keep your system updated

```bash
apt update && apt upgrade -y
```

3. **SSL Certificates**: Renew certificates automatically

```bash
crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Troubleshooting

### Application Won't Start

```bash
docker-compose logs app
```

### Database Issues

```bash
# Check database file permissions
ls -la database/
```

### SSL Issues

```bash
# Test SSL configuration
openssl s_client -connect yourdomain.com:443
```

### Performance Issues

- Monitor resource usage: `htop`
- Check disk space: `df -h`
- Scale up Linode instance if needed

## Cost Optimization

1. **Start small**: Use Nanode 1GB initially
2. **Monitor usage**: Check Linode metrics
3. **Scale appropriately**: Upgrade when needed
4. **Use Linode backups**: Enable automatic backups

## Support

- Linode Documentation: [linode.com/docs](https://linode.com/docs)
- Linode Community: [linode.com/community](https://linode.com/community)
- Linode Support: Available through your Linode dashboard
