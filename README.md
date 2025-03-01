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

# Face Recognition Feature Implementation

このプロジェクトでは、React Native/Expoを使用したモバイルアプリで顔認識機能を実装しています。

## 機能概要

顔認識機能は以下の用途に使用されています：

1. 画像内の人物を検出し、メールアドレスを自動的に識別
2. 新規予約投稿作成時の共有先（メールアドレス）の自動提案

## 技術構成

### フロントエンド

- **フレームワーク**: React Native + Expo
- **状態管理**: Reactフック（useState, useEffect）
- **ナビゲーション**: Expo Router
- **UI/UXコンポーネント**: 
  - React Nativeコアコンポーネント
  - Lucide React Nativeアイコン
  - React Native Reanimated（アニメーション）

### バックエンド

- **顔認識API**: AWS上に構築されたRESTful API
  - エンドポイント: `https://62az2hs957.execute-api.ap-northeast-1.amazonaws.com/prod/search`
  - 認証: API Key
- **データ処理**: 
  - Base64エンコードされた画像データをAPIに送信
  - 検出された顔情報とメールアドレスを受信

### 主要なコンポーネント

1. **FaceRecognitionSimpleScreen**: 
   - 顔認識のためのUI
   - カメラやギャラリーからの画像取得
   - 認識結果の表示と処理

2. **APIサービス関数**:
   - `recognizeFacesFromImage`: 画像データからの顔認識処理
   - `getSuggestedEmails`: 認識された顔からメールアドレスを抽出
   - `getFaceCoordinates`: 顔の座標情報を抽出

3. **CreateScheduledPostScreen**: 
   - 新規予約投稿作成フロー内で顔認識結果を利用
   - 認識された人物のメールアドレスを共有先として提案

## データフロー

1. ユーザーが画像を選択またはカメラで撮影
2. 画像はBase64にエンコードされてAPIに送信
3. APIは画像内の顔を検出し、類似する顔とメールアドレスを返却
4. フロントエンドでは結果を処理し、UI上に表示
5. 検出された顔情報は、投稿作成フローに引き継がれる

## 今後の改善点

- 顔認識精度の向上
- オフライン対応の追加
- プライバシーとセキュリティの強化
- パフォーマンス最適化

## 参考リソース

- [Expo ImagePicker Documentation](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [Expo FileSystem Documentation](https://docs.expo.dev/versions/latest/sdk/filesystem/)
- [Expo Router Documentation](https://docs.expo.dev/routing/introduction/)

## ディレクトリ構成

```
Guild_44
├── frontend/              # フロントエンドアプリケーション (React Native/Expo)
│   ├── app/               # Expoルーター用の画面コンポーネント
│   │   ├── (tabs)/        # タブナビゲーション画面
│   │   │   ├── index.tsx  # ホーム画面
│   │   │   ├── notifications.tsx  # 通知画面
│   │   │   ├── scheduled.tsx  # 予約投稿一覧画面
│   │   │   ├── search.tsx  # 検索画面
│   │   │   └── _layout.tsx  # タブレイアウト設定
│   │   ├── create-scheduled-post.tsx  # 新規予約投稿作成画面
│   │   ├── face-recognition-simple.tsx  # 顔認識画面
│   │   ├── photo-editor.tsx  # 写真編集画面
│   │   └── ...              # その他の画面
│   ├── utils/             # ユーティリティ関数
│   │   └── apiService.ts  # API呼び出し関数
│   ├── assets/            # 画像などの静的アセット
│   └── ...                # その他のフロントエンド関連ファイル
│
├── backend/               # バックエンドサービス
│   └── ...                # バックエンド関連ファイル
│
├── environment/           # 環境設定ファイル
│   └── ...                # Docker関連ファイルなど
│
└── ...                    # その他のプロジェクトファイル
```

## 主要機能

- **投稿管理**: 投稿の作成、予約、編集、削除
- **顔認識**: 画像内の顔を検出し、関連するユーザーを自動識別
- **スタンプ機能**: 認識した顔に自動的にスタンプを貼り付け
- **予約投稿**: 投稿日時をカレンダーから選択して予約設定
- **共有管理**: 検出された人物への自動共有機能
