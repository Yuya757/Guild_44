# Reanimated問題を修正するためのスクリプト
# Script to fix Reanimated issues

Write-Host "Reanimated問題の修正を開始します / Starting Reanimated issue fixes..." -ForegroundColor Cyan
Write-Host "--------------------------------------------------------" -ForegroundColor Cyan

# 1. キャッシュをクリア / Clear cache
Write-Host "1. キャッシュをクリアしています / Clearing cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue node_modules/.cache
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue .expo
npm cache clean --force

# 2. パッケージを再インストール / Reinstall packages
Write-Host "2. パッケージを再インストールしています / Reinstalling packages..." -ForegroundColor Yellow
npm install

# 3. バンドルをクリア / Clear bundle
Write-Host "3. バンドルをクリアしています / Clearing bundle..." -ForegroundColor Yellow
npx expo start --clear --no-dev --web

Write-Host ""
Write-Host "修正が完了しました。以下のコマンドでアプリを再起動してください:" -ForegroundColor Green
Write-Host "Fix completed. Restart your app with:" -ForegroundColor Green
Write-Host "npx expo start --clear" -ForegroundColor White 