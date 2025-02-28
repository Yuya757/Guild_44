# プロジェクトのセットアップとビルドを行うPowerShellスクリプト

# ログファイルのパスを設定
$logFile = "build.log"

# 1. lucide-react-nativeをインストール
Write-Host "Installing lucide-react-native..." -ForegroundColor Cyan
npm install lucide-react-native 2>&1 | Tee-Object -FilePath $logFile -Append

# 2. node_modulesとキャッシュをクリーンアップ
Write-Host "Cleaning up node_modules and caches..." -ForegroundColor Cyan
rimraf node_modules 2>&1 | Tee-Object -FilePath $logFile -Append
npm cache clean --force 2>&1 | Tee-Object -FilePath $logFile -Append

# 3. 依存関係をインストール
Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install 2>&1 | Tee-Object -FilePath $logFile -Append

# 4. ビルドを実行
Write-Host "Building for web..." -ForegroundColor Cyan
npm run build:web 2>&1 | Tee-Object -FilePath $logFile -Append

# 5. 完了メッセージ
Write-Host "Fix and build completed successfully! Check the log file at $logFile for details." -ForegroundColor Green 