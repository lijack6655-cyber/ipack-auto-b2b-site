$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

function Assert-That([bool]$condition, [string]$message) {
  if(-not $condition) { throw "CHECK FAILED: $message" }
}

$utf8 = New-Object System.Text.UTF8Encoding($false)
$menu = [IO.File]::ReadAllText((Join-Path $root 'assets/js/product-menu.js'), $utf8)
$directory = [IO.File]::ReadAllText((Join-Path $root 'assets/js/product-directory.js'), $utf8)
$catalog = [IO.File]::ReadAllText((Join-Path $root 'product-data.json'), $utf8) | ConvertFrom-Json
$featured = @($catalog | Where-Object { $_.featured -eq $true })
$categories = @($catalog | Where-Object { $_.category } | Select-Object -ExpandProperty category -Unique)

Assert-That ($menu -match 'featured === true') 'menu must select only API products explicitly marked featured'
Assert-That ($featured.Count -gt 0) 'catalog fixture must contain a featured product'
Assert-That ($directory -match 'products\.filter\(product => !category\.value') 'directory must filter by selected category'
Assert-That ($directory -match 'Math\.ceil\(sortedProducts\(\)\.length') 'pagination must use the filtered product count'
Assert-That ($categories -contains 'Headlights' -and $categories -contains 'Tail Lights') 'catalog fixture must cover core categories'

$pages = Get-ChildItem -Path $root -Recurse -Filter *.html -File | Where-Object { Select-String -LiteralPath $_.FullName -Pattern 'class="main-nav"' -Quiet }
$missing = @($pages | Where-Object {
  $text = [IO.File]::ReadAllText($_.FullName, $utf8)
  $cssMissing = $text -notmatch 'href="/assets/css/product-menu\.css\?v=20260922-menu"'
  $menuPos = $text.IndexOf('src="/assets/js/product-menu.js?v=20260922-menu"')
  $mainPos = $text.IndexOf('main.js')
  $cssMissing -or $menuPos -lt 0 -or $mainPos -lt 0 -or $menuPos -le $mainPos
})
Assert-That ($missing.Count -eq 0) "all $($pages.Count) static nav pages must include the absolute menu assets"

node (Join-Path $PSScriptRoot 'check-product-menu-runtime.js')
Assert-That ($LASTEXITCODE -eq 0) 'runtime category filtering check must pass'

Write-Output "PASS: $($pages.Count) nav pages, $($categories.Count) catalog categories, $($featured.Count) featured products"
