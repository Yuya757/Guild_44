# Guild_44

## 開発環境について

このプロジェクトは React Native/Expo で構築されています。

### 現在の状況

- **ローカル開発**: `frontend` ディレクトリで `npm run dev` を実行することで開発サーバーを起動できます。
- **Docker 環境**: 現在 Docker 環境での実行は問題が発生しており、正常に動作していません。詳細は `environment/DOCKER-README.md` の「既知の問題」セクションを参照してください。

### ローカル開発の始め方

1. `frontend` ディレクトリに移動します
   ```
   cd frontend
   ```

2. 依存関係をインストールします
   ```
   npm install
   ```

3. 開発サーバーを起動します
   ```
   npm run dev
   ```

4. 表示されるQRコードをスマートフォンのExpo Goアプリでスキャンするか、ブラウザで http://localhost:8081 にアクセスしてWebバージョンを確認できます。
