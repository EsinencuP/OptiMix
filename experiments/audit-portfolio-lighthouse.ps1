param(
  [string]$BaseUrl = 'http://127.0.0.1:4321',
  [string]$OutputDirectory = 'docs/portfolio-2026-10-20/final-qa/lighthouse'
)
$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force $OutputDirectory | Out-Null
$taskResults = @()
foreach ($taskPage in @('crm', 'erp')) {
  foreach ($taskMode in @('mobile', 'desktop')) {
    $taskOutput = Join-Path $OutputDirectory "$taskPage-$taskMode"
    $taskFlags = @(
      '--no-install', 'lighthouse', "$BaseUrl/portfolio/$taskPage/",
      '--chrome-flags=--headless', '--only-categories=performance,accessibility',
      '--output=json', '--output=html', "--output-path=$taskOutput", '--quiet'
    )
    if ($taskMode -eq 'desktop') {
      $taskFlags += @('--preset=desktop', '--screenEmulation.width=1280', '--screenEmulation.height=900')
    } else {
      $taskFlags += @('--screenEmulation.width=375', '--screenEmulation.height=812')
    }
    & npx @taskFlags
    if ($LASTEXITCODE -ne 0) { throw "Lighthouse failed: $taskPage / $taskMode" }
    $taskReport = Get-Content -LiteralPath "$taskOutput.report.json" -Raw | ConvertFrom-Json
    if ($taskReport.runtimeError) { throw ($taskReport.runtimeError | ConvertTo-Json) }
    $taskResult = [pscustomobject]@{
      page = $taskPage; mode = $taskMode; url = $taskReport.finalDisplayedUrl
      lighthouseVersion = $taskReport.lighthouseVersion
      performance = [math]::Round($taskReport.categories.performance.score * 100)
      accessibility = [math]::Round($taskReport.categories.accessibility.score * 100)
      lcpMs = $taskReport.audits.'largest-contentful-paint'.numericValue
      tbtMs = $taskReport.audits.'total-blocking-time'.numericValue
      cls = $taskReport.audits.'cumulative-layout-shift'.numericValue
      screen = $taskReport.configSettings.screenEmulation
      throttling = $taskReport.configSettings.throttling
      warnings = $taskReport.runWarnings
    }
    $taskResults += $taskResult
    $taskResults | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $OutputDirectory 'summary.json') -Encoding utf8
    Write-Output "$taskPage / $taskMode : Performance $($taskResult.performance), Accessibility $($taskResult.accessibility)"
  }
}
if (@($taskResults | Where-Object { $_.performance -lt 85 -or $_.accessibility -lt 90 }).Count) {
  throw 'Lighthouse target not met; inspect the saved reports.'
}
