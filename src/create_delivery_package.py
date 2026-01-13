#!/usr/bin/env python3
"""
Скрипт для создания готового пакета поставки для заказчика
"""

import os
import shutil
import zipfile
from pathlib import Path
import datetime

def create_delivery_package():
    """Создание пакета поставки для заказчика"""
    print("📦 Создание пакета поставки для Raspberry Pi...")
    
    # Создаем директорию для поставки
    delivery_dir = Path("DELIVERY_PACKAGE_RASPBERRY_PI")
    if delivery_dir.exists():
        shutil.rmtree(delivery_dir)
    delivery_dir.mkdir()
    
    # Создаем поддиректории
    (delivery_dir / "ready_to_run").mkdir()
    (delivery_dir / "source_code").mkdir()
    
    # 1. Создаем готовую к запуску версию
    print("🔨 Создание готовой к запуску версии...")
    
    # Копируем исполняемый файл (если существует)
    if Path("protected_build_raspberry/dist/PWM_Generator_Pro").exists():
        shutil.copy2(
            "protected_build_raspberry/dist/PWM_Generator_Pro",
            delivery_dir / "ready_to_run" / "PWM_Generator_Pro"
        )
        print("✅ Исполняемый файл скопирован")
    else:
        print("⚠️ Исполняемый файл не найден. Сначала запустите build_raspberry.sh")
    
    # Создаем простую инструкцию по запуску
    create_quick_start_guide(delivery_dir / "ready_to_run")
    
    # 2. Создаем версию с исходным кодом
    print("📝 Создание версии с исходным кодом...")
    
    files_to_copy = [
        "app_raspberry.py",
        "requirements.txt",
        "build_raspberry.sh",
        "build_protected_raspberry.py",
        "RASPBERRY_PI_GUIDE.md",
        "RASPBERRY_PI_SUMMARY.md"
    ]
    
    for file_path in files_to_copy:
        if os.path.exists(file_path):
            shutil.copy2(file_path, delivery_dir / "source_code" / file_path)
            print(f"✅ Скопирован: {file_path}")
    
    # Копируем директории
    directories_to_copy = ["static", "templates"]
    for dir_name in directories_to_copy:
        if os.path.exists(dir_name):
            shutil.copytree(dir_name, delivery_dir / "source_code" / dir_name)
            print(f"✅ Скопирована директория: {dir_name}")
    
    # Создаем общую инструкцию
    create_main_instructions(delivery_dir)
    
    # Создаем ZIP архив
    create_zip_archive(delivery_dir)
    
    print(f"\n🎉 Пакет поставки создан: {delivery_dir}")
    print("📁 Содержимое:")
    print("   ├── ready_to_run/     - Готовый к запуску")
    print("   ├── source_code/      - Исходный код")
    print("   ├── INSTRUCTIONS.txt  - Общие инструкции")
    print("   └── DELIVERY_PACKAGE_RASPBERRY_PI.zip")

def create_quick_start_guide(directory):
    """Создание краткой инструкции по запуску"""
    guide_content = """# 🚀 Быстрый запуск PWM Generator на Raspberry Pi

## 📋 Требования
- Raspberry Pi 4 (рекомендуется 4GB RAM)
- Raspberry Pi OS (64-bit)
- USB-кабель для подключения к устройству

## ⚡ Быстрый запуск

### 1. Установка зависимостей
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3 python3-pip -y
pip3 install flask pyserial
```

### 2. Настройка прав доступа
```bash
sudo usermod -a -G dialout $USER
sudo reboot
```

### 3. Запуск приложения
```bash
# Сделать файл исполняемым
chmod +x PWM_Generator_Pro

# Запустить приложение
./PWM_Generator_Pro
```

### 4. Доступ к приложению
- Локально: http://localhost:5000
- Удаленно: http://[IP_RASPBERRY_PI]:5000

## 🔧 Настройка порта
По умолчанию используется порт `/dev/ttyUSB0`
Для изменения порта используйте веб-интерфейс

## 📱 Мобильный доступ
Приложение автоматически адаптируется под мобильные устройства

## ❓ Поддержка
Подробная документация в файле RASPBERRY_PI_GUIDE.md
"""
    
    with open(directory / "README_Quick_Start.txt", 'w', encoding='utf-8') as f:
        f.write(guide_content)

def create_main_instructions(directory):
    """Создание основных инструкций"""
    instructions_content = f"""# 📦 PWM Generator для Raspberry Pi - Пакет поставки

**Дата создания:** {datetime.datetime.now().strftime('%d.%m.%Y %H:%M')}
**Версия:** 1.0.0
**Платформа:** Raspberry Pi 4

## 📁 Содержимое пакета

### 🚀 ready_to_run/ - Готовый к запуску
- `PWM_Generator_Pro` - Исполняемый файл
- `README_Quick_Start.txt` - Краткая инструкция

**Использование:** Для быстрого запуска без установки зависимостей

### 🔧 source_code/ - Исходный код
- `app_raspberry.py` - Основное приложение
- `static/` - Статические файлы (CSS, JS)
- `templates/` - HTML шаблоны
- `requirements.txt` - Зависимости Python
- `build_raspberry.sh` - Скрипт сборки
- `RASPBERRY_PI_GUIDE.md` - Подробное руководство

**Использование:** Для разработки и кастомизации

## 🎯 Рекомендации по выбору

### Выберите ready_to_run/ если:
- ✅ Нужно быстро запустить приложение
- ✅ Не планируете изменять код
- ✅ Хотите максимальную защиту исходного кода

### Выберите source_code/ если:
- ✅ Планируете изменять функциональность
- ✅ Нужен доступ к исходному коду
- ✅ Хотите создать собственную сборку

## 🚀 Быстрый старт

### Для готовой версии:
1. Скопируйте файлы на Raspberry Pi
2. Выполните: `chmod +x PWM_Generator_Pro`
3. Запустите: `./PWM_Generator_Pro`
4. Откройте: http://[IP_RASPBERRY_PI]:5000

### Для исходного кода:
1. Установите зависимости: `pip3 install -r requirements.txt`
2. Запустите: `python3 app_raspberry.py`
3. Откройте: http://[IP_RASPBERRY_PI]:5000

## 📞 Поддержка
- Подробная документация: RASPBERRY_PI_GUIDE.md
- Техническая сводка: RASPBERRY_PI_SUMMARY.md

---
**PWM Generator Professional v1.0.0**
**Создано:** {datetime.datetime.now().strftime('%d.%m.%Y')}
"""
    
    with open(directory / "INSTRUCTIONS.txt", 'w', encoding='utf-8') as f:
        f.write(instructions_content)

def create_zip_archive(directory):
    """Создание ZIP архива"""
    print("📦 Создание ZIP архива...")
    
    zip_filename = "DELIVERY_PACKAGE_RASPBERRY_PI.zip"
    if os.path.exists(zip_filename):
        os.remove(zip_filename)
    
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(directory):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, directory.parent)
                zipf.write(file_path, arcname)
    
    print(f"✅ ZIP архив создан: {zip_filename}")

if __name__ == "__main__":
    create_delivery_package()

