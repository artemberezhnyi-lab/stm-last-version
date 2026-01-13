@echo off
chcp 65001 >nul
echo ===============================================
echo    PWM GENERATOR - QUICK ARCHIVE UPDATE
echo ===============================================
echo.

:: Быстрая проверка основных файлов
if not exist "..\src\app.py" (
    echo ОШИБКА: src\app.py не найден!
    pause
    exit /b 1
)
if not exist "..\templates\index.html" (
    echo ОШИБКА: templates\index.html не найден!
    pause
    exit /b 1
)
if not exist "..\static\style.css" (
    echo ОШИБКА: static\style.css не найден!
    pause
    exit /b 1
)
if not exist "..\static\script.js" (
    echo ОШИБКА: static\script.js не найден!
    pause
    exit /b 1
)

echo ✓ Файлы проверены

:: Удаление старого архива
if exist "PWM_Generator_ReadOnly_RaspberryPi_Final.zip" (
    echo Удаление старого архива...
    del "PWM_Generator_ReadOnly_RaspberryPi_Final.zip"
)

:: Создание папок
if exist "RASPBERRY_PI_READONLY_BUILD" rmdir /s /q "RASPBERRY_PI_READONLY_BUILD"
mkdir "RASPBERRY_PI_READONLY_BUILD\ready_to_run\static" 2>nul
mkdir "RASPBERRY_PI_READONLY_BUILD\ready_to_run\templates" 2>nul

:: Копирование файлов
echo Копирование файлов...
copy "..\src\app.py" "RASPBERRY_PI_READONLY_BUILD\ready_to_run\app.py" >nul
copy "..\templates\index.html" "RASPBERRY_PI_READONLY_BUILD\ready_to_run\templates\" >nul
copy "..\static\*" "RASPBERRY_PI_READONLY_BUILD\ready_to_run\static\" >nul
copy "..\requirements.txt" "RASPBERRY_PI_READONLY_BUILD\ready_to_run\" >nul

:: Создание минимальной документации
echo Создание документации...
(
echo PWM GENERATOR - READY TO RUN VERSION
echo ===============================================
echo.
echo ВНИМАНИЕ: Это версия только для просмотра!
echo Код защищен от редактирования.
echo.
echo БЫСТРЫЙ СТАРТ:
echo 1. pip3 install -r requirements.txt
echo 2. python3 app.py
echo 3. Откройте http://localhost:5000
echo.
echo Версия: 2.0 ^(Car Dashboard Style^)
echo Дата: %date% %time%
) > "RASPBERRY_PI_READONLY_BUILD\ready_to_run\README.txt"

:: Создание архива
echo Создание архива...
powershell "Compress-Archive -Path 'RASPBERRY_PI_READONLY_BUILD\*' -DestinationPath '..\archive\PWM_Generator_ReadOnly_RaspberryPi_Final.zip' -Force" >nul

:: Очистка
rmdir /s /q "RASPBERRY_PI_READONLY_BUILD" >nul

echo.
echo ✅ АРХИВ ОБНОВЛЕН!
echo 📦 archive\PWM_Generator_ReadOnly_RaspberryPi_Final.zip
echo.
pause
