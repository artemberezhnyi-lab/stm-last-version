#!/bin/bash

echo "========================================"
echo "   PWM GENERATOR - RASPBERRY PI BUILD"
echo "========================================"
echo

echo "[1/4] Checking Python installation..."
python3 --version
if [ $? -ne 0 ]; then
    echo "ERROR: Python3 not found! Please install Python3 first."
    exit 1
fi
echo "✓ Python3 found"

echo
echo "[2/4] Installing required packages..."
pip3 install flask pyserial pyinstaller
if [ $? -ne 0 ]; then
    echo "WARNING: Could not install packages automatically"
    echo "Please run: pip3 install flask pyserial pyinstaller"
fi

echo
echo "[3/4] Creating protected build for Raspberry Pi..."
python3 build_protected_raspberry.py
if [ $? -ne 0 ]; then
    echo "ERROR: Build failed!"
    exit 1
fi

echo
echo "[4/4] Build completed successfully!"
echo
echo "========================================"
echo "    BUILD SUMMARY"
echo "========================================"
echo "✓ Source code obfuscated"
echo "✓ Protected executable created for Raspberry Pi"
echo "✓ Original files removed from build"
echo
echo "📁 Protected build location: protected_build_raspberry/"
echo "🚀 Executable location: protected_build_raspberry/dist/PWM_Generator_Pro"
echo
echo "The application is now protected and ready for Raspberry Pi!"
echo
echo "To run: ./protected_build_raspberry/dist/PWM_Generator_Pro"
echo
