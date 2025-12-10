# Script hỗ trợ setup database cho Laravel Backend
# Chạy script này trong PowerShell: .\setup-database.ps1

Write-Host "=== Setup Database cho Laravel Backend ===" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra file .env
if (-not (Test-Path .env)) {
    Write-Host "[1/4] Tạo file .env từ .env.example..." -ForegroundColor Yellow
    if (Test-Path .env.example) {
        Copy-Item .env.example .env
        Write-Host "✓ Đã tạo file .env" -ForegroundColor Green
    } else {
        Write-Host "✗ Không tìm thấy .env.example" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[1/4] File .env đã tồn tại" -ForegroundColor Green
}

# Kiểm tra APP_KEY
Write-Host ""
Write-Host "[2/4] Kiểm tra APP_KEY..." -ForegroundColor Yellow
$envContent = Get-Content .env -Raw
if ($envContent -notmatch "APP_KEY=base64:") {
    Write-Host "  → Đang tạo APP_KEY..." -ForegroundColor Yellow
    php artisan key:generate
    Write-Host "✓ Đã tạo APP_KEY" -ForegroundColor Green
} else {
    Write-Host "✓ APP_KEY đã được cấu hình" -ForegroundColor Green
}

# Hướng dẫn cấu hình database
Write-Host ""
Write-Host "[3/4] Cấu hình Database" -ForegroundColor Yellow
Write-Host ""
Write-Host "Vui lòng kiểm tra và cập nhật thông tin database trong file .env:" -ForegroundColor Cyan
Write-Host "  DB_CONNECTION=mysql" -ForegroundColor White
Write-Host "  DB_HOST=127.0.0.1" -ForegroundColor White
Write-Host "  DB_PORT=3306" -ForegroundColor White
Write-Host "  DB_DATABASE=taskmanagement" -ForegroundColor White
Write-Host "  DB_USERNAME=root" -ForegroundColor White
Write-Host "  DB_PASSWORD=your_password" -ForegroundColor White
Write-Host ""
Write-Host "Sau đó, tạo database MySQL:" -ForegroundColor Cyan
Write-Host "  mysql -u root -p -e `"CREATE DATABASE taskmanagement CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`"" -ForegroundColor White
Write-Host ""

$continue = Read-Host "Đã cấu hình database và tạo database MySQL chưa? (y/n)"
if ($continue -ne "y" -and $continue -ne "Y") {
    Write-Host ""
    Write-Host "Vui lòng hoàn thành các bước trên trước khi tiếp tục." -ForegroundColor Yellow
    Write-Host "Xem hướng dẫn chi tiết trong file MIGRATE.md" -ForegroundColor Cyan
    exit 0
}

# Chạy migrations
Write-Host ""
Write-Host "[4/4] Chạy migrations..." -ForegroundColor Yellow
Write-Host ""

php artisan migrate

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== Hoàn thành! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Database đã được tạo thành công!" -ForegroundColor Green
    Write-Host "Bạn có thể chạy server bằng lệnh: php artisan serve" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "=== Lỗi khi chạy migrations ===" -ForegroundColor Red
    Write-Host "Vui lòng kiểm tra:" -ForegroundColor Yellow
    Write-Host "  1. MySQL đang chạy" -ForegroundColor White
    Write-Host "  2. Database đã được tạo" -ForegroundColor White
    Write-Host "  3. Thông tin database trong .env đúng" -ForegroundColor White
    Write-Host "  4. User MySQL có quyền truy cập database" -ForegroundColor White
    Write-Host ""
    Write-Host "Xem hướng dẫn chi tiết trong file MIGRATE.md" -ForegroundColor Cyan
}

