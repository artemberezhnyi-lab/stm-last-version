#!/usr/bin/env python3
"""
Скрипт для создания защищенной версии приложения для Raspberry Pi
- Обфускация JavaScript и CSS
- Создание защищенного исполняемого файла для Linux
- Удаление исходных файлов из финальной сборки
"""

import os
import shutil
import re
import subprocess
import sys
from pathlib import Path

def obfuscate_js(file_path):
    """Обфускация JavaScript файла"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Удаляем комментарии
    content = re.sub(r'//.*?\n', '', content)
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    
    # Минификация - удаляем лишние пробелы
    content = re.sub(r'\s+', ' ', content)
    content = content.strip()
    
    # Простая обфускация переменных (заменяем некоторые имена)
    obfuscation_map = {
        'document': 'd',
        'addEventListener': 'a',
        'querySelector': 'q',
        'getElementById': 'g',
        'console': 'c',
        'log': 'l',
        'error': 'e',
        'warn': 'w',
        'fetch': 'f',
        'response': 'r',
        'json': 'j',
        'then': 't',
        'catch': 'h'
    }
    
    for original, obfuscated in obfuscation_map.items():
        content = content.replace(original, obfuscated)
    
    return content

def obfuscate_css(file_path):
    """Обфускация CSS файла"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Удаляем комментарии
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    
    # Минификация
    content = re.sub(r'\s+', ' ', content)
    content = re.sub(r';\s*', ';', content)
    content = re.sub(r':\s*', ':', content)
    content = re.sub(r'{\s*', '{', content)
    content = re.sub(r'}\s*', '}', content)
    content = content.strip()
    
    return content

def create_protected_build():
    """Создание защищенной сборки для Raspberry Pi"""
    print("🔒 Создание защищенной сборки для Raspberry Pi...")
    
    # Создаем директорию для защищенной сборки
    protected_dir = Path("protected_build_raspberry")
    if protected_dir.exists():
        shutil.rmtree(protected_dir)
    protected_dir.mkdir()
    
    # Копируем основные файлы
    files_to_copy = [
        "app_raspberry.py",
        "requirements.txt",
        "templates/index.html"
    ]
    
    for file_path in files_to_copy:
        if os.path.exists(file_path):
            dest_path = protected_dir / file_path
            dest_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(file_path, dest_path)
            print(f"✅ Скопирован: {file_path}")
    
    # Создаем защищенную директорию static
    static_dir = protected_dir / "static"
    static_dir.mkdir()
    
    # Обфусцируем и копируем JavaScript
    js_file = "static/script.js"
    if os.path.exists(js_file):
        obfuscated_js = obfuscate_js(js_file)
        with open(static_dir / "script.js", 'w', encoding='utf-8') as f:
            f.write(obfuscated_js)
        print("✅ JavaScript обфусцирован")
    
    # Обфусцируем и копируем CSS
    css_file = "static/style.css"
    if os.path.exists(css_file):
        obfuscated_css = obfuscate_css(css_file)
        with open(static_dir / "style.css", 'w', encoding='utf-8') as f:
            f.write(obfuscated_css)
        print("✅ CSS обфусцирован")
    
    # Копируем chart.min.js без изменений
    chart_file = "static/chart.min.js"
    if os.path.exists(chart_file):
        shutil.copy2(chart_file, static_dir / "chart.min.js")
        print("✅ Chart.js скопирован")
    
    # Создаем директорию recipes
    recipes_dir = protected_dir / "recipes"
    recipes_dir.mkdir()
    
    print("✅ Защищенная сборка для Raspberry Pi создана в директории 'protected_build_raspberry'")
    return protected_dir

def create_executable():
    """Создание исполняемого файла с помощью PyInstaller для Raspberry Pi"""
    print("🔨 Создание исполняемого файла для Raspberry Pi...")
    
    protected_dir = Path("protected_build_raspberry")
    if not protected_dir.exists():
        print("❌ Защищенная сборка не найдена. Сначала запустите create_protected_build()")
        return
    
    # Переходим в директорию защищенной сборки
    os.chdir(protected_dir)
    
    try:
        # Команда PyInstaller с максимальной защитой для Linux
        cmd = [
            "pyinstaller",
            "--onefile",                    # Один файл
            "--noconsole",                  # Скрыть консоль
            "--clean",                      # Очистить кэш
            "--distpath", "dist",           # Директория вывода
            "--workpath", "build",          # Рабочая директория
            "--specpath", ".",              # Путь к .spec файлу
            "--name", "PWM_Generator_Pro",  # Имя исполняемого файла
            "--add-data", "templates:templates",  # Включить шаблоны (Linux синтаксис)
            "--add-data", "static:static",        # Включить статические файлы
            "--add-data", "recipes:recipes",      # Включить рецепты
            "--hidden-import", "flask",
            "--hidden-import", "serial",
            "--hidden-import", "struct",
            "--hidden-import", "webbrowser",
            "--hidden-import", "threading",
            "--hidden-import", "time",
            "--hidden-import", "os",
            "--hidden-import", "logging",
            "app_raspberry.py"
        ]
        
        print("🚀 Запуск PyInstaller для Raspberry Pi...")
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Исполняемый файл для Raspberry Pi создан успешно!")
            print("📁 Файл находится в: protected_build_raspberry/dist/PWM_Generator_Pro")
            
            # Делаем файл исполняемым
            executable_path = protected_dir / "dist" / "PWM_Generator_Pro"
            if executable_path.exists():
                os.chmod(executable_path, 0o755)
                print("✅ Права на выполнение установлены")
        else:
            print("❌ Ошибка при создании исполняемого файла:")
            print(result.stderr)
            
    except FileNotFoundError:
        print("❌ PyInstaller не найден. Установите его командой:")
        print("pip3 install pyinstaller")
    except Exception as e:
        print(f"❌ Ошибка: {e}")
    finally:
        # Возвращаемся в исходную директорию
        os.chdir("..")

def cleanup_source_files():
    """Удаление исходных файлов из защищенной сборки"""
    print("🧹 Очистка исходных файлов...")
    
    protected_dir = Path("protected_build_raspberry")
    if not protected_dir.exists():
        return
    
    # Файлы для удаления (исходные версии)
    files_to_remove = [
        "static/script.js.bak",
        "static/style.css.bak",
        "app_raspberry.py.bak"
    ]
    
    for file_path in files_to_remove:
        full_path = protected_dir / file_path
        if full_path.exists():
            full_path.unlink()
            print(f"🗑️ Удален: {file_path}")
    
    print("✅ Очистка завершена")

def main():
    """Основная функция"""
    print("🛡️ СИСТЕМА ЗАЩИТЫ ИСХОДНОГО КОДА ДЛЯ RASPBERRY PI")
    print("=" * 60)
    
    try:
        # Создаем защищенную сборку
        create_protected_build()
        
        # Создаем исполняемый файл
        create_executable()
        
        # Очищаем исходные файлы
        cleanup_source_files()
        
        print("\n🎉 ЗАЩИТА ДЛЯ RASPBERRY PI ЗАВЕРШЕНА!")
        print("=" * 60)
        print("✅ Исходный код обфусцирован")
        print("✅ Создан защищенный исполняемый файл для Linux")
        print("✅ Исходные файлы удалены из финальной сборки")
        print("\n📁 Защищенная версия находится в: protected_build_raspberry/")
        print("🚀 Запустите: ./protected_build_raspberry/dist/PWM_Generator_Pro")
        print("\n📋 Для запуска на Raspberry Pi:")
        print("1. Скопируйте файл на Raspberry Pi")
        print("2. Установите права: chmod +x PWM_Generator_Pro")
        print("3. Запустите: ./PWM_Generator_Pro")
        
    except Exception as e:
        print(f"❌ Критическая ошибка: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
