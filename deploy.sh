#!/bin/bash
# PromtHubs VPS Deployment Script
# Bu scripti VPS'te çalıştırın

set -e

echo "🚀 PromtHubs Deployment Başlıyor..."

# Renkli output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Değişkenler
APP_DIR="/var/www/promthubs"
DOMAIN="zehedisodestore.com"

# 1. Sistem güncellemesi
echo -e "${YELLOW}[1/7] Sistem güncelleniyor...${NC}"
sudo apt update && sudo apt upgrade -y

# 2. Node.js kurulumu
echo -e "${YELLOW}[2/7] Node.js kuruluyor...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi
node --version
npm --version

# 3. PM2 kurulumu
echo -e "${YELLOW}[3/7] PM2 kuruluyor...${NC}"
sudo npm install -g pm2

# 4. Nginx kurulumu
echo -e "${YELLOW}[4/7] Nginx kuruluyor...${NC}"
sudo apt install -y nginx

# 5. Proje bağımlılıkları
echo -e "${YELLOW}[5/7] Bağımlılıklar kuruluyor...${NC}"
cd $APP_DIR
npm install --production

cd telegram-bot
npm install --production
cd ..

# 6. Nginx yapılandırması
echo -e "${YELLOW}[6/7] Nginx yapılandırılıyor...${NC}"
sudo cp nginx.conf /etc/nginx/sites-available/$DOMAIN
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# 7. PM2 ile başlat
echo -e "${YELLOW}[7/7] Uygulamalar başlatılıyor...${NC}"
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u $(whoami) --hp $HOME

echo -e "${GREEN}✅ Deployment tamamlandı!${NC}"
echo -e "${GREEN}🌐 Site: http://$DOMAIN${NC}"
echo -e "${GREEN}📊 PM2 durumu için: pm2 list${NC}"
