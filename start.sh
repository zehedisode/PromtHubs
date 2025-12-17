#!/bin/bash

# PromtHubs Card Creator - Modern Launcher
# This script starts both backend and frontend servers using npm

echo "🚀 PromtHubs Card Creator v6.0 (Secure)"
echo "========================================"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ NPM (Node Package Manager) not found!"
    echo "Please install Node.js: https://nodejs.org/"
    exit 1
fi

echo "📦 Checking dependencies..."
# Check if node_modules exists, if not install
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install
fi

echo "✅ Ready to launch"
echo "📡 Starting Backend + Frontend..."
echo ""
echo "----------------------------------------"
echo "🌐 Local:   http://localhost:5173"
echo "🔌 API:     http://localhost:3000"
echo "----------------------------------------"
echo "💡 Press Ctrl+C to stop servers"
echo ""

npm run dev
