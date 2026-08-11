param(
  [string]$SiteRoot = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Stop'
$utf8 = [System.Text.UTF8Encoding]::new($false)

$analyticsTag = '<script src="/assets/js/site-insights.js"></script>'
$analyticsCount = 0
Get-ChildItem -LiteralPath $SiteRoot -Recurse -Filter '*.html' -File | ForEach-Object {
  $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
  $hasBom = $bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF
  $html = [System.IO.File]::ReadAllText($_.FullName)
  if ($html -match '/assets/js/analytics\.js') {
    $updated = $html.Replace('/assets/js/analytics.js', '/assets/js/site-insights.js')
    $encoding = [System.Text.UTF8Encoding]::new($hasBom)
    [System.IO.File]::WriteAllText($_.FullName, $updated, $encoding)
  } elseif ($html -notmatch '/assets/js/site-insights\.js') {
    $updated = [regex]::Replace(
      $html,
      '(<script src="(?:\.\./)?assets/js/main\.js"></script>)',
      $analyticsTag + "`r`n" + '$1',
      1
    )
    if ($updated -eq $html) { return }
    $encoding = [System.Text.UTF8Encoding]::new($hasBom)
    [System.IO.File]::WriteAllText($_.FullName, $updated, $encoding)
  }
  if ([System.IO.File]::ReadAllText($_.FullName) -match '/assets/js/site-insights\.js') { $analyticsCount++ }
}

$sourcePath = Join-Path $SiteRoot 'sitemap.xml'
[xml]$source = [System.IO.File]::ReadAllText($sourcePath)
$entries = @($source.urlset.url | Where-Object { [string]$_.loc })
if ($entries.Count -eq 0 -and $source.sitemapindex.sitemap) {
  $allEntries = [System.Collections.Generic.List[object]]::new()
  foreach ($sitemap in @($source.sitemapindex.sitemap)) {
    $fileName = [IO.Path]::GetFileName(([uri][string]$sitemap.loc).AbsolutePath)
    $childPath = Join-Path $SiteRoot $fileName
    if (-not (Test-Path -LiteralPath $childPath)) { throw "Missing child sitemap: $fileName" }
    [xml]$child = [System.IO.File]::ReadAllText($childPath)
    foreach ($entry in @($child.urlset.url)) { [void]$allEntries.Add($entry) }
  }
  $entries = @($allEntries)
}
if ($entries.Count -eq 0) {
  throw 'No URL entries were found in sitemap.xml.'
}
$entries = @($entries | Where-Object { [string]$_.loc -ne 'https://www.ipackautoparts.com/quote-list' })

$changedUrls = @(
  'https://www.ipackautoparts.com/',
  'https://www.ipackautoparts.com/products',
  'https://www.ipackautoparts.com/vehicle-search',
  'https://www.ipackautoparts.com/privacy-policy',
  'https://www.ipackautoparts.com/blog/headlight-assembly-vs-head-lamp-difference'
)

function Get-SitemapGroup([string]$url) {
  $path = ([uri]$url).AbsolutePath
  if ($path -match '^/(products|oe|vehicles)/') { return 'catalog' }
  if ($path -match '^/(blog|categories|solutions)/') { return 'content' }
  return 'core'
}

function Write-UrlSitemap([string]$path, [object[]]$items) {
  $settings = [System.Xml.XmlWriterSettings]::new()
  $settings.Encoding = $utf8
  $settings.Indent = $true
  $settings.NewLineChars = "`n"
  $settings.OmitXmlDeclaration = $false
  $writer = [System.Xml.XmlWriter]::Create($path, $settings)
  try {
    $writer.WriteStartDocument()
    $writer.WriteStartElement('urlset', 'http://www.sitemaps.org/schemas/sitemap/0.9')
    foreach ($entry in $items) {
      $loc = [string]$entry.loc
      $writer.WriteStartElement('url')
      $writer.WriteElementString('loc', $loc)
      $lastmod = if ($changedUrls -contains $loc) { '2026-08-11' } else { [string]$entry.lastmod }
      if ($lastmod) { $writer.WriteElementString('lastmod', $lastmod) }
      if ($entry.changefreq) { $writer.WriteElementString('changefreq', [string]$entry.changefreq) }
      if ($entry.priority) { $writer.WriteElementString('priority', [string]$entry.priority) }
      $writer.WriteEndElement()
    }
    $writer.WriteEndElement()
    $writer.WriteEndDocument()
  } finally {
    $writer.Dispose()
  }
}

$groups = $entries | Group-Object { Get-SitemapGroup ([string]$_.loc) }
foreach ($group in $groups) {
  Write-UrlSitemap (Join-Path $SiteRoot "sitemap-$($group.Name).xml") @($group.Group)
}

$indexSettings = [System.Xml.XmlWriterSettings]::new()
$indexSettings.Encoding = $utf8
$indexSettings.Indent = $true
$indexSettings.NewLineChars = "`n"
$indexWriter = [System.Xml.XmlWriter]::Create($sourcePath, $indexSettings)
try {
  $indexWriter.WriteStartDocument()
  $indexWriter.WriteStartElement('sitemapindex', 'http://www.sitemaps.org/schemas/sitemap/0.9')
  foreach ($name in @('core', 'content', 'catalog')) {
    $indexWriter.WriteStartElement('sitemap')
    $indexWriter.WriteElementString('loc', "https://www.ipackautoparts.com/sitemap-$name.xml")
    $indexWriter.WriteElementString('lastmod', '2026-08-11')
    $indexWriter.WriteEndElement()
  }
  $indexWriter.WriteEndElement()
  $indexWriter.WriteEndDocument()
} finally {
  $indexWriter.Dispose()
}

$counts = @{}
foreach ($group in $groups) { $counts[$group.Name] = $group.Count }
[pscustomobject]@{
  HtmlFilesWithAnalytics = $analyticsCount
  CoreUrls = $counts.core
  ContentUrls = $counts.content
  CatalogUrls = $counts.catalog
}
