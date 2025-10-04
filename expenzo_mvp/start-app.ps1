Write-Host "Starting Expenso MVP..." -ForegroundColor Green

# Start MongoDB
Write-Host "Starting MongoDB..." -ForegroundColor Yellow
Start-Process -FilePath "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" -ArgumentList "--dbpath", "C:\data\db" -WindowStyle Normal

# Wait for MongoDB
Write-Host "Waiting for MongoDB to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start Server
Write-Host "Starting Server..." -ForegroundColor Yellow
Set-Location "server"
Start-Process -FilePath "node" -ArgumentList "simple-server.js" -WindowStyle Normal

# Wait for Server
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Start Client
Write-Host "Starting Client..." -ForegroundColor Yellow
Set-Location "..\client"
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Normal

Write-Host "All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "Server: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Client: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Demo Accounts:" -ForegroundColor Magenta
Write-Host "Admin: admin@demo.com / password123" -ForegroundColor White
Write-Host "Manager: manager@demo.com / password123" -ForegroundColor White
Write-Host "Employee: employee@demo.com / password123" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

