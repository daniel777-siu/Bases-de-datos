@echo off
echo ========================================
echo   SISTEMA DE RESERVAS DE HOTEL MYSQL
echo ========================================
echo.
echo Instalando dependencias...
npm install

echo.
echo ========================================
echo   INICIANDO SERVIDOR...
echo ========================================
echo.
echo El sistema estara disponible en:
echo - Frontend: http://localhost:3007
echo - API: http://localhost:3007/api
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
npm start

pause
