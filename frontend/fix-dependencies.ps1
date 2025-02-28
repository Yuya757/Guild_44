# 依存関係のバージョン問題を修正するスクリプト
# Script to fix dependency version issues

Write-Host "依存関係のバージョン問題を修正しています / Fixing dependency version issues..." -ForegroundColor Cyan
Write-Host "--------------------------------------------------------" -ForegroundColor Cyan

# 1. 古いnode_modulesを削除 / Remove old node_modules
Write-Host "1. 古いnode_modulesを削除しています / Removing old node_modules..." -ForegroundColor Yellow
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue node_modules
Remove-Item -Force -ErrorAction SilentlyContinue package-lock.json

# 2. npm キャッシュのクリア / Clear npm cache
Write-Host "2. npmキャッシュをクリアしています / Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force

# 3. 依存関係を再インストール / Reinstall dependencies
Write-Host "3. 依存関係を再インストールしています / Reinstalling dependencies..." -ForegroundColor Yellow
npm install

# 4. Expoキャッシュをクリア / Clear Expo cache
Write-Host "4. Expoキャッシュをクリアしています / Clearing Expo cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue .expo

Write-Host ""
Write-Host "依存関係のバージョン問題が修正されました。以下のコマンドでアプリを再起動してください:" -ForegroundColor Green
Write-Host "Dependency version issues fixed. Restart your app with:" -ForegroundColor Green
Write-Host "npx expo start --clear" -ForegroundColor White 