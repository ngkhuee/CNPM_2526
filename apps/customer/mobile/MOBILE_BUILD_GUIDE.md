# 🚀 MOBILE APP BUILD GUIDE - QUICK START

## 📋 Prerequisites Checklist

### ✅ Required Software
- [ ] Node.js (v16+) - Check: `node --version`
- [ ] npm (v7+) - Check: `npm --version`
- [ ] Expo CLI - Install: `npm install -g expo-cli`
- [ ] EAS CLI - Install: `npm install -g eas-cli`

### ✅ For Android Build (.APK)
- [ ] EAS Account (free tier) - Create at https://expo.dev/signup
- [ ] Java Development Kit (JDK 17+) - Optional (EAS builds in cloud)

### ✅ For iOS Build (.IPA)
- [ ] Apple Developer Account ($99/year) - If building locally
- [ ] Xcode (macOS only) - If building locally
- [ ] EAS Account - Recommended (cloud build)

---

## 🎯 FASTEST BUILD PATH - Use EAS Cloud Build

**Why EAS Cloud Build?**
- ✅ No need to install Android Studio or Xcode
- ✅ No need to manage signing certificates
- ✅ Works on any OS (Windows, Mac, Linux)
- ✅ Significantly faster (parallel builds)
- ✅ Free tier available for small projects

---

## 📱 BUILD FOR ANDROID (.APK) - 3 MINUTES

### Step 1: Setup EAS Project
```bash
cd apps/customer/mobile

# Login to Expo/EAS (one-time)
eas login
# Enter email & password (or create free account at https://expo.dev)
```

### Step 2: Configure EAS
```bash
# Initialize EAS (creates eas.json)
eas build:configure
# Choose: Android
# Choose: Production
```

### Step 3: Update API URL for Production
```bash
# Edit .env file
# Change from development to production:
cat > .env << EOF
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_API_URL=https://your-render-backend.onrender.com
EOF
```

### Step 4: Build APK
```bash
# Build APK (managed build service)
eas build --platform android --non-interactive

# Or build APK locally (faster, but needs Android Studio)
eas build --platform android --local
```

**Output:** APK will be downloaded automatically
- Location: `~/Downloads/filename.apk` (or shown in terminal)
- Time: ~5-10 minutes (EAS cloud) or ~3 minutes (local)

---

## 🍎 BUILD FOR iOS (.IPA) - Requires Mac + Apple Developer

### Step 1: Setup EAS (same as Android)
```bash
cd apps/customer/mobile
eas login
eas build:configure
# Choose: iOS
```

### Step 2: Create Apple Developer Credentials (EAS handles this)
```bash
# EAS will prompt you to create/import certificates
# Follow the prompts (usually automatic)
eas build --platform ios
```

### Step 3: Wait for Build
- Time: ~15-20 minutes (EAS cloud)
- You'll get email when done
- Download IPA from EAS dashboard

---

## 📦 BUILD BOTH (ANDROID + iOS) - Parallel

```bash
# Build both at same time
eas build --platform all

# Or build both separately
eas build --platform android
eas build --platform ios
```

---

## 🔧 LOCAL BUILD (Advanced) - For Developers

### Android APK (Local)
```bash
cd apps/customer/mobile

# Requires: Android SDK + JDK
# Install Android Studio if not already installed

# Build APK
eas build --platform android --local

# Or using Gradle directly:
npm run android
# Then Expo CLI will guide you through build process
```

---

## ⚙️ CONFIGURATION FILES NEEDED

### 1. `.env` File (Already exists ✅)
```dotenv
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_API_URL=https://your-render-backend.onrender.com
```

### 2. `app.json` (Already configured ✅)
- App name: `yummy-app`
- Package: `com.yummy.app`
- Owner: `ngkhuee` (your Expo account)

### 3. `eas.json` (Will be created by `eas build:configure`)
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "buildType": "archive"
      }
    },
    "development": {
      "development": true,
      "distribution": "internal"
    }
  }
}
```

---

## 📋 QUICK START SCRIPT

**Create file: `build-mobile.ps1` (for Windows PowerShell)**

```powershell
# Mobile Build Script
param(
    [string]$Target = "android",  # android, ios, all
    [string]$Env = "production"   # production, staging, development
)

$BackendUrl = "https://your-render-backend.onrender.com"

Write-Host "🚀 Building Mobile App: $Target (Environment: $Env)" -ForegroundColor Green

# Step 1: Update .env
Write-Host "📝 Updating .env..." -ForegroundColor Yellow
@"
EXPO_PUBLIC_ENV=$Env
EXPO_PUBLIC_API_URL=$BackendUrl
"@ | Out-File -FilePath ".env" -Encoding UTF8

# Step 2: Verify dependencies
Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Step 3: Build
Write-Host "🔨 Starting build..." -ForegroundColor Yellow

if ($Target -eq "android") {
    eas build --platform android
} elseif ($Target -eq "ios") {
    eas build --platform ios
} else {
    eas build --platform all
}

Write-Host "✅ Build complete!" -ForegroundColor Green
```

**Usage:**
```bash
./build-mobile.ps1 -Target android -Env production
./build-mobile.ps1 -Target ios -Env production
./build-mobile.ps1 -Target all -Env production
```

---

## 🐛 Troubleshooting

### Problem: "Cannot find module 'api.config'"
```bash
# Solution: Install dependencies
cd apps/customer/mobile
npm install
```

### Problem: "EXPO_PUBLIC_API_URL not defined"
```bash
# Solution: Create/update .env file
cat > .env << EOF
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_API_URL=https://your-render-backend.onrender.com
EOF
```

### Problem: "EAS CLI not installed"
```bash
# Solution: Install globally
npm install -g eas-cli

# Verify
eas --version
```

### Problem: "Build failed - Authentication"
```bash
# Solution: Login to Expo
eas login
# Or logout and login again
eas logout
eas login
```

### Problem: "Gradle build failed" (Android local build)
```bash
# Solution: Update Java version
java -version  # Should be 17+

# Or use EAS cloud build instead (no Java needed)
eas build --platform android
```

---

## 📊 BUILD TIMES COMPARISON

| Method | Time | Requirements | OS |
|--------|------|--------------|-----|
| **EAS Cloud (Recommended)** | 5-10 min | EAS Account (free) | Any |
| Local Android (Gradle) | 3-5 min | Android Studio | Windows/Mac/Linux |
| Local iOS | 10-15 min | Xcode (macOS) | macOS only |

---

## 🎯 RECOMMENDED WORKFLOW FOR DEMO

### First Time Build (15 minutes)
1. Login to Expo: `eas login`
2. Configure EAS: `eas build:configure`
3. Update `.env` with Render backend URL
4. Build: `eas build --platform android`

### Subsequent Builds (5 minutes)
1. Update `.env` if needed
2. Build: `eas build --platform android`
3. Download APK
4. Install on phone

### Before Submitting to App Store
1. Update version in `app.json`: `"version": "1.0.1"`
2. Update `.env` with production API
3. Build: `eas build --platform all`

---

## 📱 Installing APK on Android Phone

### Method 1: Direct File Install
1. Transfer `.apk` to Android phone via USB
2. Open file manager on phone
3. Tap APK file → Install

### Method 2: ADB (Advanced)
```bash
adb install path/to/app.apk
```

### Method 3: Share via Email/Drive
1. Upload APK to Google Drive
2. Share link with friends
3. They download and install

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Backend deployed on Render
- [ ] Backend URL in `.env`
- [ ] `app.json` configured correctly
- [ ] Version number updated
- [ ] Icons and splash screen present
- [ ] Tested on simulator/emulator
- [ ] Production API URL tested
- [ ] Build command runs successfully
- [ ] APK/IPA downloaded
- [ ] Installed on test device

---

## 💡 TIPS

1. **Test Before Building**
   ```bash
   expo start
   # Scan QR with Expo Go app on phone
   ```

2. **Check Build Status**
   ```bash
   eas build:list
   # Shows all your builds (online dashboard)
   ```

3. **Update API URL Anytime**
   - Edit `.env` file
   - Rebuild APK
   - Reinstall on phone

4. **Keep Version Updated**
   - `app.json` → `"version": "X.Y.Z"`
   - Increment before each production build

---

## 🆘 Need Help?

- Expo Docs: https://docs.expo.dev/
- EAS Docs: https://docs.expo.dev/eas/
- Build Configuration: https://docs.expo.dev/build/setup/
