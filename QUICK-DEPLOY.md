# Quick Deployment Commands

## On Your Local Machine

### 1. Push to GitHub
```bash
cd C:\Users\Death\Desktop\projects\XPDF
git add .
git commit -m "Production ready with translation and copy features"
git push origin main
```

## On Your Server (xpdf.nuckz.live)

### 2. Initial Setup
```bash
# SSH to server
ssh user@xpdf.nuckz.live

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Enable Apache modules
sudo a2enmod proxy proxy_http ssl headers rewrite
```

### 3. Deploy Project
```bash
# Create directory
sudo mkdir -p /var/www/xpdf
cd /var/www/xpdf

# Clone from GitHub
sudo git clone https://github.com/adhilNuckz/xpdf.git .
sudo chown -R $USER:$USER /var/www/xpdf

# Setup Backend
cd backend
npm install
echo "GEMINI_API_KEY=your_key_here" > .env
echo "PORT=4000" >> .env
echo "NODE_ENV=production" >> .env
pm2 start index.js --name xpdf-backend
pm2 save
pm2 startup

# Build Frontend
cd ../xpdf_front
npm install
npm run build

# Setup Apache
sudo cp ../apache-config.conf /etc/apache2/sites-available/xpdf.nuckz.live.conf
sudo a2ensite xpdf.nuckz.live.conf
sudo apache2ctl configtest
sudo systemctl restart apache2

# Setup SSL
sudo apt install -y certbot python3-certbot-apache
sudo certbot --apache -d xpdf.nuckz.live
```

### 4. Verify
```bash
# Check backend
pm2 status
curl http://localhost:4000

# Check frontend
curl https://xpdf.nuckz.live

# Check logs
pm2 logs xpdf-backend
sudo tail -f /var/log/apache2/xpdf.nuckz.live-error.log
```

---

## Future Updates

```bash
# On server, pull updates
cd /var/www/xpdf
git pull

# Update backend
cd backend
npm install
pm2 restart xpdf-backend

# Update frontend
cd ../xpdf_front
npm install
npm run build
```

---

## Troubleshooting One-Liners

```bash
# Restart everything
pm2 restart xpdf-backend && sudo systemctl restart apache2

# Check if backend is running
pm2 status | grep xpdf-backend

# Check backend logs
pm2 logs xpdf-backend --lines 50

# Check Apache logs
sudo tail -50 /var/log/apache2/xpdf.nuckz.live-error.log

# Test backend directly
curl -X GET http://localhost:4000

# Check open ports
sudo netstat -tulpn | grep -E '4000|80|443'
```
