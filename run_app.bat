@echo off
chcp 65001 >nul
title PWM Generator - Car Dashboard Style

echo ===============================================
echo     PWM GENERATOR - CAR DASHBOARD STYLE
echo ===============================================
echo.

:: Проверка Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ОШИБКА: Python не найден!
    echo Установите Python 3.7+ с https://python.org
    pause
    exit /b 1
)

:: Проверка зависимостей
if not exist "src\app.py" (
    echo ОШИБКА: src\app.py не найден!
    echo Убедитесь, что вы находитесь в корневой папке проекта
    pause
    exit /b 1
)

:: Установка зависимостей
echo Проверка зависимостей...
pip install -r requirements.txt --quiet

:: Запуск приложения
echo.
echo Запуск PWM Generator...
echo Откройте браузер: http://localhost:5000
echo Для остановки нажмите Ctrl+C
echo.

cd src
python app.py

pause
