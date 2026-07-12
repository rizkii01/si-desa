#!/bin/bash

# ============================================
# e-Desa Update Script
# Jalankan di VPS untuk update backend
# ============================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}=========================================="
echo "  e-Desa Update Script"
echo "==========================================${NC}"

# 1. Pull latest code
echo -e "\n${YELLOW}[1/4] Pulling latest code...${NC}"
cd /var/www/si-desa
git pull origin main

# 2. Build new image
echo -e "\n${YELLOW}[2/4] Building Docker image...${NC}"
docker-compose build server

# 3. Restart container
echo -e "\n${YELLOW}[3/4] Restarting container...${NC}"
docker-compose up -d server

# 4. Check status
echo -e "\n${YELLOW}[4/4] Checking status...${NC}"
sleep 3
if docker ps | grep -q "si-desa-api"; then
    echo -e "${GREEN}✅ Update berhasil! Server running.${NC}"
    docker logs si-desa-api --tail 3
else
    echo -e "${RED}❌ Server gagal start. Cek logs:${NC}"
    echo "docker logs si-desa-api --tail 20"
    exit 1
fi
