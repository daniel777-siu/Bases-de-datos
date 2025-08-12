@echo off
echo ========================================
echo   SISTEMA DE GESTION DE ESTUDIANTES
echo ========================================
echo.
echo Iniciando el sistema...
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no está instalado
    echo Por favor instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar si las dependencias están instaladas
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: No se pudieron instalar las dependencias
        pause
        exit /b 1
    )
)

echo.
echo Dependencias verificadas ✓
echo.
echo IMPORTANTE: Asegúrate de que MySQL esté ejecutándose
echo y que hayas ejecutado el script database.sql
echo.
echo Iniciando servidor...
echo.

REM Iniciar el servidor
npm start

pause 