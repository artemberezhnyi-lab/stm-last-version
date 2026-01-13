@echo off
echo ========================================
echo    PWM GENERATOR - SECURE BUILD
echo ========================================
echo.

echo [1/4] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found! Please install Python first.
    pause
    exit /b 1
)
echo ✓ Python found

echo.
echo [2/4] Installing required packages...
pip install pyinstaller >nul 2>&1
if errorlevel 1 (
    echo WARNING: Could not install PyInstaller automatically
    echo Please run: pip install pyinstaller
)

echo.
echo [3/4] Creating protected build...
python build_protected.py
if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo [4/4] Build completed successfully!
echo.
echo ========================================
echo    BUILD SUMMARY
echo ========================================
echo ✓ Source code obfuscated
echo ✓ Protected executable created
echo ✓ Original files removed from build
echo.
echo 📁 Protected build location: protected_build\
echo 🚀 Executable location: protected_build\dist\PWM_Generator_Pro.exe
echo.
echo The application is now protected and ready for distribution!
echo.
pause

