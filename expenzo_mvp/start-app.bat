@echo off
echo Starting Expenso MVP...

echo Starting MongoDB...
start "MongoDB" cmd /k "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe --dbpath C:\data\db"

echo Waiting for MongoDB to start...
timeout /t 5 /nobreak

echo Starting Server...
cd server
start "Server" cmd /k "node simple-server.js"

echo Waiting for server to start...
timeout /t 3 /nobreak

echo Starting Client...
cd ..\client
start "Client" cmd /k "npm run dev"

echo All services started!
echo.
echo Server: http://localhost:5000
echo Client: http://localhost:3000
echo.
echo Demo Accounts:
echo Admin: admin@demo.com / password123
echo Manager: manager@demo.com / password123
echo Employee: employee@demo.com / password123
echo.
pause

