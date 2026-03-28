@echo off
set NEXT_TELEMETRY_DISABLED=1
echo n | npx next dev --turbopack > next_server_output.txt 2>&1
