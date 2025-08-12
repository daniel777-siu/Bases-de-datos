@echo off
echo ========================================
echo    RIWI - Sistema de Gestión de Cursos
echo ========================================
echo.

echo Instalando dependencias...
npm install

echo.
echo Iniciando servidor...
echo Puerto: 3004
echo URL: http://localhost:3004
echo.

npm start

pause
