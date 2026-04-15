param(
  [int]$Port = 8080
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$routes = @{
  "/" = @{ Path = (Join-Path $root "index.html"); ContentType = "text/html; charset=utf-8" }
  "/index.html" = @{ Path = (Join-Path $root "index.html"); ContentType = "text/html; charset=utf-8" }
  "/app.js" = @{ Path = (Join-Path $root "app.js"); ContentType = "application/javascript; charset=utf-8" }
  "/voucher-data.json" = @{ Path = (Join-Path $root "voucher-data.json"); ContentType = "application/json; charset=utf-8" }
}

function Send-HttpResponse {
  param(
    [System.Net.Sockets.NetworkStream]$Stream,
    [int]$StatusCode,
    [string]$ReasonPhrase,
    [byte[]]$BodyBytes,
    [string]$ContentType = "text/plain; charset=utf-8"
  )

  $headerText = @(
    "HTTP/1.1 $StatusCode $ReasonPhrase",
    "Content-Type: $ContentType",
    "Content-Length: $($BodyBytes.Length)",
    "Connection: close",
    "Cache-Control: no-store",
    "",
    ""
  ) -join "`r`n"

  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headerText)
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  if ($BodyBytes.Length -gt 0) {
    $Stream.Write($BodyBytes, 0, $BodyBytes.Length)
  }
  $Stream.Flush()
}

function Send-JsonResponse {
  param(
    [System.Net.Sockets.NetworkStream]$Stream,
    [int]$StatusCode,
    [string]$ReasonPhrase,
    [object]$Payload
  )

  $json = $Payload | ConvertTo-Json -Depth 8
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
  Send-HttpResponse -Stream $Stream -StatusCode $StatusCode -ReasonPhrase $ReasonPhrase -BodyBytes $bytes -ContentType "application/json; charset=utf-8"
}

function Send-FileResponse {
  param(
    [System.Net.Sockets.NetworkStream]$Stream,
    [string]$Path,
    [string]$ContentType
  )

  if (-not (Test-Path -LiteralPath $Path)) {
    Send-JsonResponse -Stream $Stream -StatusCode 404 -ReasonPhrase "Not Found" -Payload @{ error = "File not found." }
    return
  }

  $bytes = [System.IO.File]::ReadAllBytes($Path)
  Send-HttpResponse -Stream $Stream -StatusCode 200 -ReasonPhrase "OK" -BodyBytes $bytes -ContentType $ContentType
}

function Read-RequestPath {
  param([System.Net.Sockets.NetworkStream]$Stream)

  $reader = New-Object System.IO.StreamReader($Stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
  $requestLine = $reader.ReadLine()

  if ([string]::IsNullOrWhiteSpace($requestLine)) {
    return $null
  }

  while ($true) {
    $line = $reader.ReadLine()
    if ([string]::IsNullOrEmpty($line)) {
      break
    }
  }

  $parts = $requestLine.Split(" ")
  if ($parts.Length -lt 2) {
    return $null
  }

  return @{
    Method = $parts[0]
    Path = $parts[1]
  }
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$listener.Start()

Write-Host "Housing Voucher Real-Time Tracker running at http://localhost:$Port"

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()

    try {
      $stream = $client.GetStream()
      $request = Read-RequestPath -Stream $stream

      if ($null -eq $request) {
        Send-JsonResponse -Stream $stream -StatusCode 400 -ReasonPhrase "Bad Request" -Payload @{ error = "Invalid request." }
        continue
      }

      if ($request.Method -ne "GET") {
        Send-JsonResponse -Stream $stream -StatusCode 405 -ReasonPhrase "Method Not Allowed" -Payload @{ error = "Only GET is supported." }
        continue
      }

      if ($request.Path -eq "/api/openings") {
        $payload = Get-Content -Raw -LiteralPath (Join-Path $root "voucher-data.json") | ConvertFrom-Json
        Send-JsonResponse -Stream $stream -StatusCode 200 -ReasonPhrase "OK" -Payload $payload
        continue
      }

      if ($routes.ContainsKey($request.Path)) {
        $route = $routes[$request.Path]
        Send-FileResponse -Stream $stream -Path $route.Path -ContentType $route.ContentType
        continue
      }

      Send-JsonResponse -Stream $stream -StatusCode 404 -ReasonPhrase "Not Found" -Payload @{ error = "Not found." }
    } catch {
      if ($stream) {
        Send-JsonResponse -Stream $stream -StatusCode 500 -ReasonPhrase "Internal Server Error" -Payload @{
          error = "Request failed."
          detail = $_.Exception.Message
        }
      }
    } finally {
      if ($stream) { $stream.Dispose() }
      $client.Close()
    }
  }
} finally {
  $listener.Stop()
}
