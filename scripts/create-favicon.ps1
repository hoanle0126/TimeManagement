# Script để tạo favicon.png
Add-Type -AssemblyName System.Drawing

$bmp = New-Object System.Drawing.Bitmap(64, 64)
$graphics = [System.Drawing.Graphics]::FromImage($bmp)
$graphics.Clear([System.Drawing.Color]::FromArgb(76, 175, 80))

$font = New-Object System.Drawing.Font('Arial', 32, [System.Drawing.FontStyle]::Bold)
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$graphics.DrawString('✓', $font, $brush, 12, 8)

$bmp.Save('assets/favicon.png', [System.Drawing.Imaging.ImageFormat]::Png)

$graphics.Dispose()
$bmp.Dispose()

Write-Host 'Favicon created successfully!'

