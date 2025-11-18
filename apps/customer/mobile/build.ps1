#!/usr/bin/env powershell
# Build script for Yummy Mobile App
# Builds both Android APK and iOS IPA using Expo EAS

param(
    [string]$BuildType = "both" # both, android, ios
)

Write-Host "🚀 Yummy Mobile App Builder" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Check if Expo CLI is installed
if (-not (Get-Command expo -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Expo CLI not found. Installing..." -ForegroundColor Red
    npm install -g expo-cli
}

# Check if EAS CLI is installed
if (-not (Get-Command eas -ErrorAction SilentlyContinue)) {
    Write-Host "❌ EAS CLI not found. Installing..." -ForegroundColor Red
    npm install -g eas-cli
}

# Get current directory
$ScriptDir = Get-Location
Write-Host "📍 Working directory: $ScriptDir" -ForegroundColor Yellow
Write-Host ""

# Check if we're in the mobile app directory
if (-not (Test-Path "app.json")) {
    Write-Host "❌ Error: app.json not found. Are you in the mobile app directory?" -ForegroundColor Red
    exit 1
}

# Parse app.json for version info
$appJson = Get-Content "app.json" | ConvertFrom-Json
$appName = $appJson.expo.name
$version = $appJson.expo.version
$androidPackage = $appJson.expo.android.package
$iosBundleId = $appJson.expo.ios.bundleIdentifier

Write-Host "📦 Build Configuration:" -ForegroundColor Yellow
Write-Host "  App Name: $appName"
Write-Host "  Version: $version"
Write-Host "  Bundle ID (Android): $androidPackage"
Write-Host "  Bundle ID (iOS): $iosBundleId"
Write-Host ""

# Install dependencies
Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Android Build
if ($BuildType -eq "android" -or $BuildType -eq "both") {
    Write-Host ""
    Write-Host "🤖 Building Android APK..." -ForegroundColor Yellow
    Write-Host "This may take 10-20 minutes..." -ForegroundColor Gray
    Write-Host ""
    
    eas build --platform android --local
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Android APK built successfully!" -ForegroundColor Green
        Write-Host "   APK location: ./dist" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Android build failed!" -ForegroundColor Red
        exit 1
    }
}

# iOS Build
if ($BuildType -eq "ios" -or $BuildType -eq "both") {
    Write-Host ""
    Write-Host "🍎 Building iOS IPA..." -ForegroundColor Yellow
    Write-Host "This may take 15-25 minutes..." -ForegroundColor Gray
    Write-Host ""
    
    eas build --platform ios --local
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ iOS IPA built successfully!" -ForegroundColor Green
        Write-Host "   IPA location: ./dist" -ForegroundColor Green
    }
    else {
        Write-Host "❌ iOS build failed!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🎉 Build complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Output locations:" -ForegroundColor Yellow
Write-Host "  APK: ./dist/$appName-*.apk"
Write-Host "  IPA: ./dist/$appName-*.ipa"
Write-Host ""
Write-Host "ℹ️  Usage:" -ForegroundColor Yellow
Write-Host "  .\build.ps1                # Build both APK and IPA (default)"
Write-Host "  .\build.ps1 -BuildType android  # Build only Android APK"
Write-Host "  .\build.ps1 -BuildType ios      # Build only iOS IPA"
Write-Host ""
Write-Host "📝 Note: If you get execution policy error, run:" -ForegroundColor Yellow
Write-Host "  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Gray
Write-Host ""
