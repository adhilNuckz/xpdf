# XPDF Deployment Guide

## 🚀 Deploying to xpdf.nuckz.live

### Prerequisites
- Ubuntu/Debian server with root access
- Apache2 installed
- Node.js 20.16+ installed
- PM2 for process management
- SSL certificate (Let's Encrypt)

---

## 📋 Step-by-Step Deployment

### 1. Install Required Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x (if not installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Apache2 (if not installed)
sudo apt install -y apache2

# Enable required Apache modules
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod ssl
sudo a2enmod headers
sudo a2enmod rewrite
```

### 2. Upload Project to Server

```bash
# SSH into your server
ssh user@xpdf.nuckz.live

# Create directory
sudo mkdir -p /var/www/xpdf
cd /var/www/xpdf

# Clone or upload your project
# Option 1: Using git
git clone https://github.com/adhilNuckz/xpdf.git .

# Option 2: Upload via SCP from local machine
# scp -r C:\Users\Death\Desktop\projects\XPDF user@xpdf.nuckz.live:/var/www/xpdf/

# Set ownership
sudo chown -R $USER:$USER /var/www/xpdf
```

### 3. Setup Backend

```bash
cd /var/www/xpdf/backend

# Install dependencies
npm install

# Create .env file
nano .env
```

Add to `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=4000
NODE_ENV=production
```

```bash
# Test backend
npm start

# If it works, stop it (Ctrl+C) and start with PM2
pm2 start index.js --name xpdf-backend
pm2 save
pm2 startup
```

### 4. Build Frontend

```bash
cd /var/www/xpdf/xpdf_front

# Update API URL in App.jsx to use your domain
nano src/App.jsx
```

Change this line:
```javascript
const API_BASE_URL = 'http://localhost:4000';
```
To:
```javascript
const API_BASE_URL = 'https://xpdf.nuckz.live';
```

```bash
# Install dependencies
npm install

# Build for production
npm run build

# The build folder will be created as 'dist'
```

### 5. Setup Apache Virtual Host

```bash
# Create Apache config file
sudo nano /etc/apache2/sites-available/xpdf.nuckz.live.conf
```

Paste the configuration from `apache-config.conf` (see below).

```bash
# Enable the site
sudo a2ensite xpdf.nuckz.live.conf

# Test Apache configuration
sudo apache2ctl configtest

# If OK, restart Apache
sudo systemctl restart apache2
```

### 6. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-apache

# Get SSL certificate
sudo certbot --apache -d xpdf.nuckz.live

# Auto-renewal is set up automatically
# Test renewal:
sudo certbot renew --dry-run
```

### 7. Configure Firewall

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 🔄 Updates & Maintenance

### Update Backend
```bash
cd /var/www/xpdf/backend
git pull  # or upload new files
npm install
pm2 restart xpdf-backend
```

### Update Frontend
```bash
cd /var/www/xpdf/xpdf_front
git pull  # or upload new files
npm install
npm run build
# Build files automatically update in dist/
```

### Check Backend Status
```bash
pm2 status
pm2 logs xpdf-backend
pm2 restart xpdf-backend
```

### Check Apache Status
```bash
sudo systemctl status apache2
sudo tail -f /var/log/apache2/error.log
```

---

## 📊 Monitoring

```bash
# View backend logs
pm2 logs xpdf-backend

# Monitor system resources
pm2 monit

# Apache access logs
sudo tail -f /var/log/apache2/xpdf.nuckz.live-access.log

# Apache error logs
sudo tail -f /var/log/apache2/xpdf.nuckz.live-error.log
```

---

## 🔧 Troubleshooting

### Backend not starting
```bash
# Check logs
pm2 logs xpdf-backend

# Check if port 4000 is in use
sudo netstat -tulpn | grep 4000

# Restart
pm2 restart xpdf-backend
```

### Frontend not loading
```bash
# Check Apache error logs
sudo tail -50 /var/log/apache2/error.log

# Check if build files exist
ls -la /var/www/xpdf/xpdf_front/dist

# Rebuild frontend
cd /var/www/xpdf/xpdf_front
npm run build
```

### API calls failing
- Check if backend is running: `pm2 status`
- Check firewall: `sudo ufw status`
- Check Apache proxy: `sudo apache2ctl configtest`
- Check CORS settings in backend

---

## 🎯 Production Checklist

- [ ] Node.js 20.16+ installed
- [ ] Backend running on PM2
- [ ] Frontend built and deployed
- [ ] Apache configured with proxy
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] .env file with GEMINI_API_KEY
- [ ] PM2 startup configured
- [ ] DNS pointing to server IP
- [ ] CORS properly configured
- [ ] Error logs monitored

---

## 📝 Notes

- Backend runs on port 4000 (proxied through Apache)
- Frontend served from `/var/www/xpdf/xpdf_front/dist`
- SSL automatically redirects HTTP to HTTPS
- PM2 auto-restarts backend on crash
- Let's Encrypt certificate auto-renews every 90 days
