#!/bin/bash

DOMAIN="yourdomain.com" # ← change this to your domain name
EMAIL="admin@domain.com"

echo "🔧 Updating system..."
sudo apt update && sudo apt upgrade -y

echo "💾 Installing dependencies..."
sudo apt install -y curl git build-essential ufw nginx snapd

echo "📦 Installing Node.js (LTS)..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

echo "🔁 Installing PM2..."
sudo npm install -g pm2

echo "🛢️ Installing MongoDB Community Edition..."
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
  --dearmor

echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

sudo apt update
sudo apt install -y mongodb-org

echo "🛠️ Enabling and starting MongoDB..."
sudo systemctl enable mongod
sudo systemctl start mongod

echo "🌐 Setting up UFW firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

echo "🌍 Cloning project repo..."
cd /home/$USER
git clone https://github.com/YOUR_USERNAME/contact-portal.git
cd contact-portal

echo "⚙️ Installing backend dependencies..."
cd backend
npm install

echo "🚀 Starting backend with PM2..."
pm2 start server.js --name contact-backend
pm2 save
pm2 startup

echo "🖥️ Installing frontend dependencies..."
cd ../frontend
npm install
npm run build

echo "🧭 Configuring Nginx for domain $DOMAIN..."
sudo tee /etc/nginx/sites-available/contact <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location / {
        root /home/$USER/contact-portal/frontend/build;
        index index.html;
        try_files \$uri /index.html;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/contact /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

echo "🔐 Setting up HTTPS with Certbot..."
sudo snap install core && sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m your-email@example.com

echo "✅ Setup complete. Your portal should now be live at $DOMAIN"
