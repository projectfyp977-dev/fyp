# Free port 5000 (Windows). Run: .\kill-port-5000.ps1
# Use when you get "EADDRINUSE: address already in use 0.0.0.0:5000"
$conn = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($conn) {
  $pid = $conn.OwningProcess
  Stop-Process -Id $pid -Force
  Write-Host "Killed process $pid that was using port 5000."
} else {
  Write-Host "No process is using port 5000."
}
