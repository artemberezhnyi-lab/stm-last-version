#!/bin/bash

# PWM Generator - Protected Version for Raspberry Pi
# Автоматический запуск приложения с защитой кода

echo "==============================================="
echo "    PWM GENERATOR - CAR DASHBOARD STYLE"
echo "==============================================="
echo ""

# Проверка Python
if ! command -v python3 &> /dev/null; then
    echo "ОШИБКА: Python3 не найден!"
    echo "Установите Python3: sudo apt install python3"
    exit 1
fi

# Проверка pip
if ! command -v pip3 &> /dev/null; then
    echo "ОШИБКА: pip3 не найден!"
    echo "Установите pip3: sudo apt install python3-pip"
    exit 1
fi

# Установка зависимостей
echo "Проверка зависимостей..."
pip3 install -r requirements.txt --user --quiet

# Проверка порта
if [ ! -e "/dev/serial0" ]; then
    echo "ПРЕДУПРЕЖДЕНИЕ: /dev/serial0 не найден!"
    echo "Убедитесь, что последовательный порт включен в raspi-config"
    echo "sudo raspi-config -> Interface Options -> Serial Port -> Enable"
fi

# Проверка прав доступа
if [ ! -r "/dev/serial0" ]; then
    echo "ПРЕДУПРЕЖДЕНИЕ: Нет прав доступа к /dev/serial0"
    echo "Добавьте пользователя в группу dialout:"
    echo "sudo usermod -a -G dialout $USER"
    echo "Перезагрузите систему после этого"
fi

# Запуск приложения
echo ""
echo "Запуск PWM Generator..."
echo "Откройте браузер: http://localhost:5000"
echo "Для остановки нажмите Ctrl+C"
echo ""

python3 app.py
