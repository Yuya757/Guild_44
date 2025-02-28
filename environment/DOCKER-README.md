# Docker 環境での開発ガイド

このプロジェクトは Docker を使って開発環境を一貫して管理できるように設定されています。以下の手順に従って、環境を構築し利用することができます。

## 既知の問題 (2024年3月1日現在)

**現在、Docker 環境は正常に動作していません。以下の問題が確認されています：**

1. **QRコードが機能しない**: Docker コンテナ内で生成される QR コードは、コンテナ内部の URL（例: `exp://host.docker.internal:8083`）を使用しているため、モバイルデバイスから接続できません。

2. **ホストネットワークの問題**: Windows 環境での `network_mode: "host"` 設定が正しく機能せず、コンテナとホスト間の通信に問題が生じています。

3. **依存関係のインストールが持続しない**: ボリュームマウントの設定により、コンテナ再起動時に一部の依存関係がリセットされる問題があります。

4. **ポート競合**: 複数のプロセスが同じポートを使用しようとして競合することがあります。

**回避策**:

現時点では、ローカル環境（Docker を使用せず）で開発を行うことを推奨します。メインの README.md に記載されている手順に従ってください。

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