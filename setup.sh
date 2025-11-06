#!/bin/bash

# WM Dashboard Setup Script
# This script automates the setup process for the WM application

set -e

echo "🚀 Setting up WM Dashboard..."
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
fi

echo "📦 Installing dependencies..."
pnpm install

echo "🔧 Generating Prisma client..."
pnpm prisma:generate

echo "🗄️  Running database migrations..."
pnpm prisma:migrate dev --name init

echo "🌱 Seeding database with demo data..."
pnpm prisma:seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎉 You can now run the development server:"
echo "   pnpm dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""


