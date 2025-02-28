# Common issues fixing script
# このスクリプトは一般的な問題を解決するのに役立ちます

Write-Host "フォント問題の解決 / Fixing Font Issues" -ForegroundColor Cyan
Write-Host "--------------------------------------------------------" -ForegroundColor Cyan
Write-Host "1. Interフォントをダウンロードしてください / Download Inter fonts:" -ForegroundColor Yellow
Write-Host "   - https://fonts.google.com/specimen/Inter"
Write-Host "2. ダウンロードしたフォントファイルを以下のフォルダに配置してください / Place the font files in this directory:" -ForegroundColor Yellow
Write-Host "   - assets/fonts/Inter-Regular.ttf"
Write-Host "   - assets/fonts/Inter-Medium.ttf"
Write-Host "   - assets/fonts/Inter-SemiBold.ttf"
Write-Host "   - assets/fonts/Inter-Bold.ttf"
Write-Host ""

Write-Host "Reanimated問題の解決 / Fixing Reanimated Issues" -ForegroundColor Cyan
Write-Host "--------------------------------------------------------" -ForegroundColor Cyan
Write-Host "1. babel.config.jsファイルが正しく設定されていることを確認 / Check babel.config.js configuration" -ForegroundColor Yellow
Write-Host "   - 'react-native-reanimated/plugin'がプラグインリストに含まれていること"
Write-Host "2. キャッシュをクリアしてビルドし直す / Clear cache and rebuild" -ForegroundColor Yellow

$confirmation = Read-Host "Reanimated問題を解決するためにキャッシュをクリアしますか？ / Clear cache to fix Reanimated issues? (y/n)"
if ($confirmation -eq 'y') {
    Write-Host "キャッシュクリア中... / Clearing cache..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue .expo
    npx expo start --clear --no-dev --minify
}

Write-Host ""
Write-Host "依存関係の問題解決 / Fixing Dependency Issues" -ForegroundColor Cyan
Write-Host "--------------------------------------------------------" -ForegroundColor Cyan
Write-Host "パッケージの再インストール / Reinstalling packages:" -ForegroundColor Yellow

$confirmation = Read-Host "既存のnode_modulesフォルダとキャッシュをクリーンアップしますか？ / Clean up existing node_modules and caches? (y/n)"
if ($confirmation -eq 'y') {
    # Clean up
    Write-Host "クリーンアップ中... / Cleaning up..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue node_modules
    Remove-Item -Force -ErrorAction SilentlyContinue package-lock.json
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue .expo
    npm cache clean --force
    
    # Reinstall
    Write-Host "依存関係を再インストール中... / Reinstalling dependencies..." -ForegroundColor Cyan
    npm install
}

Write-Host ""
Write-Host "Expoのキャッシュクリア / Clearing Expo cache" -ForegroundColor Cyan
Write-Host "--------------------------------------------------------" -ForegroundColor Cyan
$confirmation = Read-Host "Expoのキャッシュをクリアしますか？ / Clear Expo cache? (y/n)"
if ($confirmation -eq 'y') {
    npx expo start --clear
}

Write-Host ""
Write-Host "問題が解決しない場合: / If problems persist:" -ForegroundColor Cyan
Write-Host "--------------------------------------------------------" -ForegroundColor Cyan
Write-Host "1. Node.jsのバージョンが互換性があることを確認してください / Ensure Node.js version is compatible" -ForegroundColor Yellow
Write-Host "   - Node.js v18以上を推奨 / Node.js v18+ recommended"
Write-Host "2. グローバルExpo CLIを再インストールしてください / Reinstall global Expo CLI:" -ForegroundColor Yellow
Write-Host "   - npm uninstall -g expo-cli"
Write-Host "   - npm install -g expo-cli"
Write-Host "3. Reanimatedの公式トラブルシューティングガイドを確認: / Check Reanimated troubleshooting:" -ForegroundColor Yellow
Write-Host "   - https://docs.swmansion.com/react-native-reanimated/docs/guides/troubleshooting/native-part-of-reanimated-doesnt-seem-to-be-initialized"
Write-Host ""

Write-Host "完了しました！ / Completed!" -ForegroundColor Green 