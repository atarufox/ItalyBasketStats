@echo off
title FIP Stats Live Web App
echo ===================================================
echo     🏀 FIP STATS LIVE WEB APP (v2.0.0)
echo ===================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Node.js rilevato. Avvio del server locale FIP...
    start http://localhost:3000
    node "%~dp0server.js"
) else (
    echo [INFO] Apertura diretta interfaccia browser...
    start "" "%~dp0index.html"
)
