# Script de Validación de Tests
# Este script verifica que todos los archivos de test existen y tienen el formato correcto

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔍 VALIDACIÓN DE TESTS - JASMINE" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Array de archivos de test
$testFiles = @(
    @{Name="cart.spec.js"; ExpectedTests=19},
    @{Name="compra.spec.js"; ExpectedTests=18},
    @{Name="login.spec.js"; ExpectedTests=23},
    @{Name="register.spec.js"; ExpectedTests=32},
    @{Name="catalogo.spec.js"; ExpectedTests=29}
)

$totalTests = 0
$filesFound = 0

foreach ($testFile in $testFiles) {
    $filePath = "test\$($testFile.Name)"
    
    if (Test-Path $filePath) {
        $filesFound++
        $content = Get-Content $filePath -Raw
        
        # Contar describe() y it()
        $describeCount = ([regex]::Matches($content, "describe\(")).Count
        $itCount = ([regex]::Matches($content, "it\(")).Count
        
        Write-Host "✅ $($testFile.Name)" -ForegroundColor Green
        Write-Host "   📊 Suites (describe): $describeCount" -ForegroundColor White
        Write-Host "   🧪 Tests (it): $itCount (esperados: $($testFile.ExpectedTests))" -ForegroundColor White
        
        # Verificar sintaxis Jasmine
        if ($content -match "expect\(" -and $content -match "jasmine\.createSpy\(") {
            Write-Host "   ✓ Sintaxis Jasmine correcta" -ForegroundColor DarkGreen
        }
        
        $totalTests += $itCount
        Write-Host ""
    } else {
        Write-Host "❌ $($testFile.Name) - NO ENCONTRADO" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host "───────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "📈 RESUMEN:" -ForegroundColor Yellow
Write-Host "   Archivos encontrados: $filesFound / $($testFiles.Count)" -ForegroundColor White
Write-Host "   Total de tests: $totalTests" -ForegroundColor White
Write-Host ""

# Verificar archivos en public
Write-Host "📂 Verificando archivos en public/test..." -ForegroundColor Cyan
$publicTestPath = "public\test"
if (Test-Path $publicTestPath) {
    $publicFiles = Get-ChildItem $publicTestPath -Filter "*.spec.js"
    Write-Host "   ✅ Carpeta public/test existe" -ForegroundColor Green
    Write-Host "   📄 Archivos en public/test: $($publicFiles.Count)" -ForegroundColor White
} else {
    Write-Host "   ❌ Carpeta public/test NO existe" -ForegroundColor Red
    Write-Host "   💡 Ejecuta: Copy-Item -Path 'test' -Destination 'public/test' -Recurse -Force" -ForegroundColor Yellow
}
Write-Host ""

# Verificar test-runner.html
Write-Host "🌐 Verificando test-runner.html..." -ForegroundColor Cyan
if (Test-Path "public\test-runner.html") {
    Write-Host "   ✅ test-runner.html existe en public/" -ForegroundColor Green
    Write-Host "   🔗 URL: http://localhost:3000/test-runner.html" -ForegroundColor Cyan
} else {
    Write-Host "   ❌ test-runner.html NO encontrado en public/" -ForegroundColor Red
}
Write-Host ""

# Verificar servidor
Write-Host "🚀 Verificando servidor..." -ForegroundColor Cyan
$response = $null
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Servidor corriendo en localhost:3000" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Servidor NO está corriendo" -ForegroundColor Red
    Write-Host "   💡 Ejecuta: npm start" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📝 SIGUIENTE PASO:" -ForegroundColor Yellow
Write-Host "     Abre http://localhost:3000/test-runner.html" -ForegroundColor White
Write-Host "     y presiona F5 para ver los tests ejecutándose" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
