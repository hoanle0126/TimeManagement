# Script hướng dẫn cập nhật logo FLOW
# Chạy script này: .\scripts\update-logo.ps1

Write-Host "=== Hướng dẫn cập nhật Logo FLOW ===" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra xem có file logo mới không
$logoFiles = @("flow-logo.png", "flow-logo.svg", "logo.png", "logo.svg")
$foundLogo = $null

foreach ($file in $logoFiles) {
    if (Test-Path $file) {
        $foundLogo = $file
        break
    }
    if (Test-Path "assets\$file") {
        $foundLogo = "assets\$file"
        break
    }
}

if ($foundLogo) {
    Write-Host "✓ Tìm thấy file logo: $foundLogo" -ForegroundColor Green
    Write-Host ""
    Write-Host "Đang sao chép logo..." -ForegroundColor Yellow
    
    # Copy logo thành favicon.png
    Copy-Item $foundLogo -Destination "assets\favicon.png" -Force
    Write-Host "✓ Đã cập nhật favicon.png" -ForegroundColor Green
    
    # Nếu là PNG, có thể copy thành icon.png
    if ($foundLogo -like "*.png") {
        Copy-Item $foundLogo -Destination "assets\icon.png" -Force
        Write-Host "✓ Đã cập nhật icon.png" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "=== Hoàn thành! ===" -ForegroundColor Green
    Write-Host "Logo đã được cập nhật. Khởi động lại server để xem thay đổi." -ForegroundColor Cyan
} else {
    Write-Host "⚠ Không tìm thấy file logo mới." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Vui lòng đặt file logo FLOW vào một trong các vị trí sau:" -ForegroundColor Cyan
    Write-Host "  - flow-logo.png (hoặc .svg)" -ForegroundColor White
    Write-Host "  - logo.png (hoặc .svg)" -ForegroundColor White
    Write-Host "  - assets/flow-logo.png" -ForegroundColor White
    Write-Host "  - assets/logo.png" -ForegroundColor White
    Write-Host ""
    Write-Host "Sau đó chạy lại script này." -ForegroundColor Yellow
}

