# Docker 環境での開発ガイド

このプロジェクトは Docker を使って開発環境を一貫して管理できるように設定されています。以下の手順に従って、環境を構築し利用することができます。

## 前提条件

- [Docker](https://www.docker.com/products/docker-desktop/) がインストールされていること
- [Docker Compose](https://docs.docker.com/compose/install/) がインストールされていること（Docker Desktop には通常含まれています）

## 使用方法

### 開発環境の起動

PowerShell スクリプトを使う場合：

```powershell
./environment/docker-dev.ps1 start
```

手動で Docker Compose を使う場合：

```
docker-compose -f ./environment/docker-compose.yml up -d expo-app
```

これにより、開発サーバーが起動し、以下のポートが公開されます：
- http://localhost:19000 - Expo サーバー
- http://localhost:19002 - Expo DevTools

### 開発環境の停止

PowerShell スクリプトを使う場合：

```powershell
./environment/docker-dev.ps1 stop
```

手動で Docker Compose を使う場合：

```
docker-compose -f ./environment/docker-compose.yml down
```

### Web 版のビルド

PowerShell スクリプトを使う場合：

```powershell
./environment/docker-dev.ps1 web
```

手動で Docker Compose を使う場合：

```
docker-compose -f ./environment/docker-compose.yml run --rm web-build
```

ビルドされたファイルは `frontend/dist` ディレクトリに出力されます。

### 開発環境の再ビルド

依存関係に変更があった場合などに Docker イメージを再ビルドします：

```powershell
./environment/docker-dev.ps1 rebuild
```

## トラブルシューティング

### よくあるエラー

1. **ポートが既に使用されている**

   エラーメッセージ: `Error starting userland proxy: Bind for 0.0.0.0:19000: unexpected error address already in use`
   
   解決策: 競合しているプロセスを終了するか、Docker Compose ファイルでポート番号を変更してください。

2. **Node モジュールの互換性エラー**

   エラーメッセージ: `Node modules version mismatch` または同様のエラー
   
   解決策: コンテナ内で node_modules を再生成します：
   
   ```
   docker-compose -f ./environment/docker-compose.yml exec expo-app npm install
   ```

3. **Metro Bundler が応答しない**

   解決策: コンテナを再起動して、キャッシュをクリアします：
   
   ```powershell
   ./environment/docker-dev.ps1 stop
   docker-compose -f ./environment/docker-compose.yml run --rm expo-app npx expo start --clear
   ./environment/docker-dev.ps1 start
   ```

4. **ホットリロードが機能しない**

   解決策: 環境変数 `REACT_NATIVE_PACKAGER_HOSTNAME` が正しく設定されていることを確認し、必要に応じてホスト IP アドレスに変更してください。

## Docker コンテナにアクセスする

コンテナ内でコマンドを実行する必要がある場合：

```
docker-compose -f ./environment/docker-compose.yml exec expo-app bash
```

これにより、実行中の Expo コンテナ内で bash シェルが開きます。

## Docker リソースのクリーンアップ

不要な Docker リソースをクリーンアップするには：

```powershell
./environment/docker-dev.ps1 clean
```

これにより、未使用のコンテナ、イメージ、ネットワークなどがクリーンアップされます。 