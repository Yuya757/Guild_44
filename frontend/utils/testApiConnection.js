// APIの接続をテストするスクリプト
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// テスト用の画像ファイルパス（プロジェクト内にテスト用の画像を配置することを想定）
const TEST_IMAGE_PATH = path.join(__dirname, '../assets/images/test-image.jpeg');

// APIの設定
const API_URL = 'https://62az2hs957.execute-api.ap-northeast-1.amazonaws.com/prod/search';
const API_KEY = 'dSOovEKqYwgehvBr24g57tWpqJn1DfManBOt1WXd';

// 画像のMIMEタイプを拡張子から判定する関数
function getMimeTypeFromPath(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  switch (extension) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    default:
      return 'image/jpeg'; // デフォルトはJPEG
  }
}

async function testApiConnection() {
  try {
    console.log('🔍 APIテストを開始します...');
    
    // 画像ファイルの読み込み
    if (!fs.existsSync(TEST_IMAGE_PATH)) {
      console.error('❌ テスト画像が見つかりません:', TEST_IMAGE_PATH);
      console.log('テスト用の画像を assets フォルダに配置してください。');
      console.log('サポートしている形式: JPG, PNG, WebP');
      return;
    }
    
    // MIMEタイプを取得
    const mimeType = getMimeTypeFromPath(TEST_IMAGE_PATH);
    
    // 画像をBase64に変換
    const imageBuffer = fs.readFileSync(TEST_IMAGE_PATH);
    const base64Image = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
    
    console.log(`📷 テスト画像を読み込みました (形式: ${mimeType})`);
    
    // APIリクエスト
    console.log('🌐 APIにリクエストを送信中...');
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({
        image_base64str: base64Image,
        threshold: 80.0
      })
    });
    
    if (!response.ok) {
      throw new Error(`APIリクエストが失敗しました: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const result = typeof data === 'string' ? JSON.parse(data) : data;
    
    console.log('✅ APIからのレスポンスを受信しました');
    console.log('ステータス:', result.status);
    console.log('メッセージ:', result.message);
    console.log('検出された顔:', result.faces.length);
    
    if (result.faces.length > 0) {
      console.log('\n🧑 検出された顔の情報:');
      result.faces.forEach((face, index) => {
        console.log(`\n👤 顔 #${index + 1}:`);
        console.log(`  - FaceID: ${face.face_id}`);
        console.log(`  - 類似度: ${face.similarity}%`);
        
        if (face.member_info && face.member_info.Email) {
          console.log(`  - メールアドレス: ${face.member_info.Email.S}`);
        }
        
        if (face.member_info && face.member_info.BoundingBox) {
          console.log('  - 位置情報:');
          console.log(`    左: ${face.member_info.BoundingBox.M.Left.N}`);
          console.log(`    上: ${face.member_info.BoundingBox.M.Top.N}`);
          console.log(`    幅: ${face.member_info.BoundingBox.M.Width.N}`);
          console.log(`    高さ: ${face.member_info.BoundingBox.M.Height.N}`);
        }
      });
    }
    
    console.log('\n🎉 APIテスト完了!');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  }
}

// テスト実行
testApiConnection(); 