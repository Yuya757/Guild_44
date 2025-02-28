/**
 * 顔認識APIのモックレスポンス
 * バックエンドと接続せずにフロントエンドのテストに使用します
 */

export const mockSuccessResponse = {
  status: 'success',
  message: 'Match found',
  timestamp: new Date().toISOString(),
  faces: [
    {
      face_id: 'mock-face-id-1',
      similarity: 98.5,
      member_info: {
        FaceId: { S: 'mock-face-id-1' },
        Email: { S: 'test-user1@example.com' },
        Name: { S: '山田 太郎' },
        Department: { S: '開発部' },
        BoundingBox: {
          M: {
            Left: { N: '0.2' },
            Top: { N: '0.3' },
            Width: { N: '0.25' },
            Height: { N: '0.25' }
          }
        }
      }
    },
    {
      face_id: 'mock-face-id-2',
      similarity: 92.1,
      member_info: {
        FaceId: { S: 'mock-face-id-2' },
        Email: { S: 'test-user2@example.com' },
        Name: { S: '鈴木 花子' },
        Department: { S: 'マーケティング部' },
        BoundingBox: {
          M: {
            Left: { N: '0.6' },
            Top: { N: '0.35' },
            Width: { N: '0.2' },
            Height: { N: '0.2' }
          }
        }
      }
    }
  ]
};

export const mockNoMatchResponse = {
  status: 'success',
  message: 'No matching face found',
  timestamp: new Date().toISOString(),
  faces: []
};

export const mockErrorResponse = {
  status: 'error',
  message: 'An error occurred during face recognition',
  timestamp: new Date().toISOString(),
  faces: []
};

/**
 * モックAPIレスポンスを使用した顔認識機能のテスト
 * 実際のAPIの代わりにモックデータを返します
 */
export async function mockRecognizeFaces(useCase: 'success' | 'no-match' | 'error' = 'success') {
  // 現実的なAPIレスポンス時間をシミュレート
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  switch (useCase) {
    case 'success':
      return mockSuccessResponse;
    case 'no-match':
      return mockNoMatchResponse;
    case 'error':
    default:
      throw new Error('Mock API error for testing');
  }
}

/**
 * デモ用のテストシナリオ説明
 * テスト方法と期待される結果を説明します
 */
export const testScenarios = [
  {
    id: 'real-api',
    title: '実際のAPIでテスト',
    description: '実際のバックエンドAPIに接続して顔認識を行います。顔が含まれている写真を使用してください。',
    expected: '顔が検出された場合、FaceIDやメールアドレスなどの情報が表示されます。'
  },
  {
    id: 'mock-success',
    title: 'モック成功レスポンス',
    description: 'バックエンドに接続せずにテスト成功のモックデータを使用します。',
    expected: '2人の顔が検出され、メールアドレスなどの情報が表示されます。'
  },
  {
    id: 'mock-no-match',
    title: 'モック一致なしレスポンス',
    description: '顔は検出されるが一致するユーザーがない状態をシミュレートします。',
    expected: '「顔が検出されませんでした」というメッセージが表示されます。'
  },
  {
    id: 'mock-error',
    title: 'モックエラーレスポンス',
    description: 'APIエラーの状態をシミュレートします。',
    expected: 'エラーメッセージが表示されます。'
  }
]; 