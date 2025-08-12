@echo off
echo ========================================
echo    Biblioteca Digital - Caso 6
echo ========================================
echo.
echo Instalando dependencias...
npm install

if %errorlevel% neq 0 (
    echo Error instalando dependencias
    pause
    exit /b 1
)

echo.
echo Dependencias instaladas correctamente
echo.
echo Iniciando servidor...
echo.
echo Accede a: http://localhost:3006
echo.
echo Usuarios de prueba:
echo   - admin / password
echo   - bibliotecario / password
echo   - usuario1 / password
echo   - usuario2 / password
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

npm start

pause
