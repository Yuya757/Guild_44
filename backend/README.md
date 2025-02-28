# Face Recognition Authentication API

このプロジェクトは、AWS RekognitionとDynamoDBを用いた顔認証APIです。写真を送信することで、登録されたメンバー情報と照合し、対応するユーザー情報を返すAPIを提供します。

## 使用技術
- AWS Lambda (Python)
- AWS Rekognition
- AWS DynamoDB
- API Gateway
- React (フロントエンドで使用予定)

## システム構成図
```
[Client]
   │
   │ (Base64画像送信)
   ▼
[API Gateway]
   │
   ▼
[AWS Lambda]
   │
   ├─ Rekognitionで顔認証
   └─ DynamoDBからメンバー情報を取得
   ▼
[レスポンス (MemberId, Name, FaceId)]
```

## API仕様
### リクエスト
| Method | Path    | 説明                  |
|--------|--------|---------------------|
| POST   | `/search` | 顔認証を行い、メンバー情報を取得 |

### リクエストボディ
```json
{
  "image_base64str": "Base64エンコードされた画像",
  "threshold": 90
}
```

### レスポンス
| フィールド     | 型     | 説明          |
|--------------|-------|-------------|
| status       | string | 成功/失敗 |
| FaceId      | string | Rekognitionで検出された顔ID |
| MemberId    | string | DynamoDBから取得したメンバーID |
| Name        | string | メンバー名 |
| timestamp   | string | 実行時刻 |


## APIキーの使い方
```bash
echo "{\"threshold\": 90, \"image_base64str\": \"base64の文字列\"}" \
| curl -X POST "https://{API_GATEWAY_URL}/prod/search" \
-H "X-Api-Key: {API_KEY}" \
-d @-
```

## 環境変数
| 環境変数    | 説明             |
|------------|----------------|
| COLLECTION_ID | Rekognitionのコレクション名 |
| TABLE_NAME   | DynamoDBのテーブル名   |
| GSI_NAME     | GSIのインデックス名    |

