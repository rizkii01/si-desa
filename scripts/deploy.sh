#!/bin/bash

# ============================================
# e-Desa Deployment Script
# Untuk IDCloudHost VPS (Ubuntu 22.04)
# ============================================

set -e

echo "=========================================="
echo "  e-Desa Deployment Script"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ============================================
# 1. Update System
# ============================================
echo -e "\n${YELLOW}[1/8] Updating system...${NC}"
sudo apt update && sudo apt upgrade -y

# ============================================
# 2. Install Docker
# ============================================
echo -e "\n${YELLOW}[2/8] Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sudo sh
    sudo usermod -aG docker $USER
    echo -e "${GREEN}Docker installed successfully${NC}"
else
    echo -e "${GREEN}Docker already installed${NC}"
fi

# ============================================
# 3. Install Docker Compose
# ============================================
echo -e "\n${YELLOW}[3/8] Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    sudo apt install docker-compose -y
    echo -e "${GREEN}Docker Compose installed successfully${NC}"
else
    echo -e "${GREEN}Docker Compose already installed${NC}"
fi

# ============================================
# 4. Install Nginx (optional, for manual config)
# ============================================
echo -e "\n${YELLOW}[4/8] Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    sudo apt install nginx -y
    echo -e "${GREEN}Nginx installed successfully${NC}"
else
    echo -e "${GREEN}Nginx already installed${NC}"
fi

# ============================================
# 5. Install Certbot
# ============================================
echo -e "\n${YELLOW}[5/8] Installing Certbot...${NC}"
if ! command -v certbot &> /dev/null; then
    sudo apt install certbot python3-certbot-nginx -y
    echo -e "${GREEN}Certbot installed successfully${NC}"
else
    echo -e "${GREEN}Certbot already installed${NC}"
fi

# ============================================
# 6. Install Node.js 18
# ============================================
echo -e "\n${YELLOW}[6/8] Installing Node.js 18...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    echo -e "${GREEN}Node.js installed successfully${NC}"
else
    echo -e "${GREEN}Node.js already installed${NC}"
fi

# ============================================
# 7. Install PM2
# ============================================
echo -e "\n${YELLOW}[7/8] Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    pm2 startup
    echo -e "${GREEN}PM2 installed successfully${NC}"
else
    echo -e "${GREEN}PM2 already installed${NC}"
fi

# ============================================
# 8. Clone Repository
# ============================================
echo -e "\n${YELLOW}[8/8] Setting up application...${NC}"

# Create app directory
sudo mkdir -p /var/www/si-desa
sudo chown $USER:$USER /var/www/si-desa

# Clone repo (ganti dengan URL repo kamu)
cd /var/www
if [ ! -d "si-desa/.git" ]; then
    git clone <REPO_URL> si-desa
fi

cd si-desa/server

# Install dependencies
npm install --production

# Create .env file
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}Please edit .env file with your configuration${NC}"
    nano .env
fi

# Create logs directory
mkdir -p logs

# Create uploads directory
mkdir -p uploads/profil uploads/smart/pdfs

# ============================================
# Setup Complete
# ============================================
echo -e "\n${GREEN}=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Edit /var/www/si-desa/server/.env with your configuration"
echo "2. Run: cd /var/www/si-desa && docker-compose up -d"
echo "3. Setup SSL: certbot --nginx -d api.yourdomain.my.id"
echo "4. Point DNS: api.yourdomain.my.id -> $(curl -s ifconfig.me)"
echo ""
echo "Commands:"
echo "  docker-compose up -d    # Start services"
echo "  docker-compose down     # Stop services"
echo "  docker-compose logs -f  # View logs"
echo "  pm2 status              # Check PM2 status"
echo "  pm2 logs                # View PM2 logs"
echo -e "${NC}"
