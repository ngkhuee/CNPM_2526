#!/bin/bash
# Build script for Yummy Mobile App
# Builds both Android APK and iOS IPA using Expo

set -e

echo "🚀 Yummy Mobile App Builder"
echo "============================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo -e "${RED}❌ Expo CLI not found. Installing...${NC}"
    npm install -g expo-cli
fi

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo -e "${RED}❌ EAS CLI not found. Installing...${NC}"
    npm install -g eas-cli
fi

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${YELLOW}📍 Working directory: $SCRIPT_DIR${NC}"
echo ""

# Check if we're in the mobile app directory
if [ ! -f "app.json" ]; then
    echo -e "${RED}❌ Error: app.json not found. Are you in the mobile app directory?${NC}"
    exit 1
fi

# Parse command line arguments
BUILD_TYPE=${1:-"both"} # both, android, ios

echo -e "${YELLOW}📦 Build Configuration:${NC}"
echo "  App Name: $(grep '"name"' app.json | head -1 | cut -d'"' -f4)"
echo "  Version: $(grep '"version"' app.json | head -1 | cut -d'"' -f4)"
echo "  Bundle ID (Android): $(grep '"package"' app.json | cut -d'"' -f4)"
echo "  Bundle ID (iOS): $(grep '"bundleIdentifier"' app.json | cut -d'"' -f4)"
echo ""

# Install dependencies
echo -e "${YELLOW}📥 Installing dependencies...${NC}"
npm install

# Android Build
if [ "$BUILD_TYPE" = "android" ] || [ "$BUILD_TYPE" = "both" ]; then
    echo ""
    echo -e "${YELLOW}🤖 Building Android APK...${NC}"
    echo "This may take 10-20 minutes..."
    echo ""
    
    eas build --platform android --local
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Android APK built successfully!${NC}"
        echo "   APK saved to: ./dist"
    else
        echo -e "${RED}❌ Android build failed!${NC}"
        exit 1
    fi
fi

# iOS Build
if [ "$BUILD_TYPE" = "ios" ] || [ "$BUILD_TYPE" = "both" ]; then
    echo ""
    echo -e "${YELLOW}🍎 Building iOS IPA...${NC}"
    echo "This may take 15-25 minutes..."
    echo ""
    
    eas build --platform ios --local
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ iOS IPA built successfully!${NC}"
        echo "   IPA saved to: ./dist"
    else
        echo -e "${RED}❌ iOS build failed!${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}🎉 Build complete!${NC}"
echo ""
echo -e "${YELLOW}📁 Output locations:${NC}"
echo "  APK: ./dist/yummy-app-*.apk"
echo "  IPA: ./dist/yummy-app-*.ipa"
echo ""
echo -e "${YELLOW}ℹ️  Usage:${NC}"
echo "  ./build.sh both     # Build both APK and IPA (default)"
echo "  ./build.sh android  # Build only Android APK"
echo "  ./build.sh ios      # Build only iOS IPA"
echo ""
