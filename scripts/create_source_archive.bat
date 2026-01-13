@echo off
chcp 65001 >nul
echo ===============================================
echo    PWM GENERATOR - SOURCE CODE ARCHIVE
echo ===============================================
echo.

:: Проверка файлов
echo [1/4] Проверка файлов...
if not exist "app.py" (
    echo ОШИБКА: app.py не найден!
    pause
    exit /b 1
)
if not exist "app_raspberry.py" (
    echo ОШИБКА: app_raspberry.py не найден!
    pause
    exit /b 1
)
if not exist "templates\index.html" (
    echo ОШИБКА: templates\index.html не найден!
    pause
    exit /b 1
)
if not exist "static\style.css" (
    echo ОШИБКА: static\style.css не найден!
    pause
    exit /b 1
)
if not exist "static\script.js" (
    echo ОШИБКА: static\script.js не найден!
    pause
    exit /b 1
)
echo ✓ Все файлы найдены

:: Создание папки для архива
echo [2/4] Создание структуры архива...
set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "timestamp=%timestamp: =0%"
set "archive_name=PWM_Generator_SourceCode_%timestamp%.zip"

if exist "SOURCE_ARCHIVE_TEMP" rmdir /s /q "SOURCE_ARCHIVE_TEMP"
mkdir "SOURCE_ARCHIVE_TEMP"

:: Копирование всех файлов проекта
echo [3/4] Копирование файлов проекта...
copy "*.py" "SOURCE_ARCHIVE_TEMP\" >nul
copy "*.bat" "SOURCE_ARCHIVE_TEMP\" >nul
copy "*.sh" "SOURCE_ARCHIVE_TEMP\" >nul
copy "*.txt" "SOURCE_ARCHIVE_TEMP\" >nul
copy "*.md" "SOURCE_ARCHIVE_TEMP\" >nul
copy "*.spec" "SOURCE_ARCHIVE_TEMP\" >nul

:: Копирование папок
xcopy "templates" "SOURCE_ARCHIVE_TEMP\templates\" /E /I /Q >nul
xcopy "static" "SOURCE_ARCHIVE_TEMP\static\" /E /I /Q >nul
xcopy "recipes" "SOURCE_ARCHIVE_TEMP\recipes\" /E /I /Q >nul 2>nul
xcopy "protected_build" "SOURCE_ARCHIVE_TEMP\protected_build\" /E /I /Q >nul 2>nul

:: Создание README для исходного кода
(
echo ===============================================
echo     PWM GENERATOR - SOURCE CODE
echo ===============================================
echo.
echo Это полная версия с исходным кодом для разработчика.
echo.
echo СОДЕРЖИМОЕ:
echo - app.py - Основное приложение для Windows
echo - app_raspberry.py - Версия для Raspberry Pi
echo - templates/ - HTML шаблоны
echo - static/ - CSS, JavaScript, изображения
echo - requirements.txt - Зависимости Python
echo - build_*.bat - Скрипты сборки
echo - update_archive.bat - Обновление архива
echo.
echo ОСОБЕННОСТИ ВЕРСИИ 2.0:
echo ✅ Автомобильный дизайн интерфейса
echo ✅ Темная тема с неоновыми акцентами
echo ✅ Вертикальное расположение каналов
echo ✅ Широкое окно превью импульсов
echo ✅ Компактные поля ввода значений
echo ✅ Статичный порт /dev/serial0
echo ✅ Адаптивный дизайн
echo.
echo ЗАПУСК:
echo Windows: python app.py
echo Raspberry Pi: python app_raspberry.py
echo.
echo Версия: 2.0 ^(Car Dashboard Style^)
echo Дата сборки: %date% %time%
echo ===============================================
) > "SOURCE_ARCHIVE_TEMP\README_SOURCE.txt"

echo ✓ Файлы скопированы

:: Создание архива
echo [4/4] Создание архива...
powershell "Compress-Archive -Path 'SOURCE_ARCHIVE_TEMP\*' -DestinationPath '%archive_name%' -Force" >nul
if errorlevel 1 (
    echo ОШИБКА: Не удалось создать архив!
    pause
    exit /b 1
)

:: Очистка
rmdir /s /q "SOURCE_ARCHIVE_TEMP" >nul

echo ✓ Архив создан: %archive_name%
echo.
echo ===============================================
echo     ИСХОДНЫЙ КОД АРХИВИРОВАН!
echo ===============================================
echo.
echo 📦 Имя архива: %archive_name%
echo 📁 Размер: 
for %%A in ("%archive_name%") do echo    %%~zA байт
echo.
echo ✅ Готово для резервного копирования!
echo.
echo Нажмите любую клавишу для выхода...
pause >nul
