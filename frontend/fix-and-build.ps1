# プロジェクトのセットアップとビルドを行うPowerShellスクリプト

# 1. lucide-react-nativeをインストール
Write-Host "Installing lucide-react-native..." -ForegroundColor Cyan
npm install lucide-react-native

# 2. node_modulesとキャッシュをクリーンアップ
Write-Host "Cleaning up node_modules and caches..." -ForegroundColor Cyan
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
Remove-Item -Recurse -Force .expo
npm cache clean --force

# 3. 依存関係をインストール
Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install

# 4. ビルドを実行
Write-Host "Building for web..." -ForegroundColor Cyan
npm run build:web

# 5. 完了メッセージ
Write-Host "Fix and build completed successfully!" -ForegroundColor Green 