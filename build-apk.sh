#!/usr/bin/env bash
set -euo pipefail

RELEASE=false
for arg in "$@"; do
  case $arg in
    --release) RELEASE=true ;;
  esac
done

# ── Prerequisites ─────────────────────────────────────────────────────────────
if ! command -v java &>/dev/null; then
  echo "ERROR: Java not found. Install JDK 17+  (e.g. sudo apt install openjdk-17-jdk)" >&2
  exit 1
fi

if [[ -z "${ANDROID_HOME:-}" ]]; then
  echo "ERROR: \$ANDROID_HOME is not set. Point it to your Android SDK directory." >&2
  exit 1
fi

# ── Install Capacitor + Node.js Mobile deps if missing ────────────────────────
if ! node -e "require('@capacitor/core')" &>/dev/null; then
  echo "Installing Capacitor packages..."
  npm install @capacitor/core @capacitor/cli @capacitor/android
fi

if ! node -e "require('capacitor-nodejs')" &>/dev/null; then
  echo "Installing capacitor-nodejs..."
  npm install https://github.com/hampoelz/capacitor-nodejs/releases/download/v1.0.0-beta.9/capacitor-nodejs.tgz
fi

# ── Install embedded server dependencies ──────────────────────────────────────
echo "Installing server dependencies..."
(cd nodejs && npm install --omit=dev)

# ── Init Capacitor if android/ dir is absent ──────────────────────────────────
if [[ ! -d android ]]; then
  echo "Adding Android platform..."
  npx cap add android
fi

# ── Build Next.js as a static export ──────────────────────────────────────────
echo "Building Next.js static export..."
BUILD_TARGET=android npm run build

# ── Sync web assets into the Android project ──────────────────────────────────
echo "Syncing with Capacitor..."
npx cap sync android

# ── Build APK ─────────────────────────────────────────────────────────────────
cd android
chmod +x gradlew

if $RELEASE; then
  echo "Building release APK..."
  ./gradlew assembleRelease
  APK_PATH="app/build/outputs/apk/release/app-release-unsigned.apk"
else
  echo "Building debug APK..."
  ./gradlew assembleDebug
  APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
fi

cd ..

echo ""
echo "Done! APK: android/$APK_PATH"
