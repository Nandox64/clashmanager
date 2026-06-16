@echo off
cd /d "%~dp0"
set CI=true
start "Clash Manager Dev Server" /d "apps\web" pnpm dev
echo Esperando a que el servidor de desarrollo inicie para ejecutar warmup...
node scripts/warmup.mjs
pause
