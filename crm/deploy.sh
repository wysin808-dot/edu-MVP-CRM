#!/bin/bash
# BCI CRM — Alibaba Cloud ECS Deployment Script
# Usage: ./deploy.sh

set -e

echo "🚀 BCI CRM 部署脚本"
echo "===================="

# Check .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ .env.production 文件不存在，请先配置环境变量"
    exit 1
fi

# Load env vars
export $(grep -v '^#' .env.production | xargs)

# Build and start
echo "📦 构建 Docker 镜像..."
docker compose --env-file .env.production build

echo "🔄 启动服务..."
docker compose --env-file .env.production up -d

echo ""
echo "✅ 部署完成！"
echo "   访问 http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_SERVER_IP'):80"
echo ""
echo "📋 常用命令："
echo "   查看日志:  docker compose logs -f crm"
echo "   重启服务:  docker compose restart"
echo "   停止服务:  docker compose down"
echo "   更新部署:  git pull && ./deploy.sh"
