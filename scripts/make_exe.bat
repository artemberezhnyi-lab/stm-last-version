@echo off
echo Creating executable for PWM Generator...
echo.

:: Set the working directory to the script location
cd /d "%~dp0"

:: Check Python installation first
where python >nul 2>&1
if %errorLevel% neq 0 (
    echo Error: Python is not found!
    echo Please run check_and_build.bat first
    pause
    exit /b 1
)

:: Install PyInstaller if not already installed
echo Installing/Updating PyInstaller...
C:\Users\User\AppData\Local\Programs\Python\Python312\python.exe -m pip install --upgrade pyinstaller

:: Clean up previous builds
echo.
echo Cleaning up previous builds...
if exist "build" rd /s /q "build"
if exist "dist" rd /s /q "dist"

:: Create the executable
echo.
echo Building executable...
echo This may take a few minutes...
echo.

C:\Users\User\AppData\Local\Programs\Python\Python312\python.exe -m PyInstaller --noconfirm --clean ^
    --name="PWM Generator" ^
    --add-data "templates;templates" ^
    --add-data "static;static" ^
    --hidden-import=flask ^
    --hidden-import=serial ^
    --hidden-import=serial.tools.list_ports ^
    --hidden-import=werkzeug.routing ^
    --hidden-import=werkzeug.middleware ^
    --hidden-import=werkzeug.middleware.proxy_fix ^
    --hidden-import=jinja2.ext ^
    --console ^
    app.py

if %errorLevel% neq 0 (
    echo.
    echo Error: Failed to create executable
    echo Please check the error messages above
    pause
    exit /b 1
)

:: Create a shortcut to run the executable
echo @echo off > "Run PWM Generator.bat"
echo cd /d "%%~dp0\dist\PWM Generator" >> "Run PWM Generator.bat"
echo echo Starting PWM Generator... >> "Run PWM Generator.bat"
echo echo Please wait while the application starts... >> "Run PWM Generator.bat"
echo echo If the browser doesn't open automatically, go to: http://127.0.0.1:5000 >> "Run PWM Generator.bat"
echo echo. >> "Run PWM Generator.bat"
echo "PWM Generator.exe" >> "Run PWM Generator.bat"
echo pause >> "Run PWM Generator.bat"

echo.
echo Build completed successfully!
echo.
echo The executable has been created in: dist\PWM Generator\
echo You can run the application using "Run PWM Generator.bat"
echo.
pause 