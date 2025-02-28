param (
    [string]$action = "start"
)

# プロジェクトルートディレクトリを設定
$projectRoot = $PSScriptRoot | Split-Path -Parent

# 使用可能なアクションを表示する関数
function Show-Help {
    Write-Host "使用法: ./environment/docker-dev.ps1 [アクション]" -ForegroundColor Cyan
    Write-Host "アクション:" -ForegroundColor Cyan
    Write-Host "  start   - 開発環境を起動します（デフォルト）" -ForegroundColor Yellow
    Write-Host "  stop    - 開発環境を停止します" -ForegroundColor Yellow
    Write-Host "  rebuild - 開発環境を再ビルドします" -ForegroundColor Yellow
    Write-Host "  web     - Web版をビルドします" -ForegroundColor Yellow
    Write-Host "  logs    - コンテナのログを表示します" -ForegroundColor Yellow
    Write-Host "  clean   - 未使用のDockerリソースをクリーンアップします" -ForegroundColor Yellow
    Write-Host "  help    - このヘルプメッセージを表示します" -ForegroundColor Yellow
}

# 開発環境を起動する関数
function Start-DevEnvironment {
    Write-Host "Dockerコンテナを起動しています..." -ForegroundColor Cyan
    Set-Location $projectRoot
    docker-compose -f ./environment/docker-compose.yml up -d expo-app
    Write-Host "Expoアプリは http://localhost:19002 でアクセスできます" -ForegroundColor Green
    
    # ログを表示するかどうか尋ねる
    $showLogs = Read-Host "コンテナのログを表示しますか？ (y/n)"
    if ($showLogs -eq "y") {
        docker-compose -f ./environment/docker-compose.yml logs -f expo-app
    }
}

# 開発環境を停止する関数
function Stop-DevEnvironment {
    Write-Host "Dockerコンテナを停止しています..." -ForegroundColor Cyan
    Set-Location $projectRoot
    docker-compose -f ./environment/docker-compose.yml down
    Write-Host "開発環境を停止しました" -ForegroundColor Green
}

# 開発環境を再ビルドする関数
function Rebuild-DevEnvironment {
    Write-Host "Dockerイメージを再ビルドしています..." -ForegroundColor Cyan
    Set-Location $projectRoot
    docker-compose -f ./environment/docker-compose.yml build --no-cache expo-app
    Write-Host "再ビルドが完了しました" -ForegroundColor Green
    
    # 起動するかどうか尋ねる
    $startAfterRebuild = Read-Host "環境を今すぐ起動しますか？ (y/n)"
    if ($startAfterRebuild -eq "y") {
        Start-DevEnvironment
    }
}

# Web版をビルドする関数
function Build-WebVersion {
    Write-Host "Web版をビルドしています..." -ForegroundColor Cyan
    Set-Location $projectRoot
    docker-compose -f ./environment/docker-compose.yml run --rm web-build
    Write-Host "ビルドが完了しました。frontend/distディレクトリをチェックしてください" -ForegroundColor Green
}

# コンテナのログを表示する関数
function Show-Logs {
    Write-Host "コンテナのログを表示しています..." -ForegroundColor Cyan
    Set-Location $projectRoot
    docker-compose -f ./environment/docker-compose.yml logs -f expo-app
}

# Dockerリソースをクリーンアップする関数
function Clean-DockerResources {
    Write-Host "未使用のDockerリソースをクリーンアップしています..." -ForegroundColor Cyan
    docker system prune -f
    Write-Host "クリーンアップが完了しました" -ForegroundColor Green
}

# アクションに基づいて適切な関数を実行
switch ($action) {
    "start" { Start-DevEnvironment }
    "stop" { Stop-DevEnvironment }
    "rebuild" { Rebuild-DevEnvironment }
    "web" { Build-WebVersion }
    "logs" { Show-Logs }
    "clean" { Clean-DockerResources }
    "help" { Show-Help }
    default { 
        Write-Host "不明なアクション: $action" -ForegroundColor Red
        Show-Help 
    }
} 