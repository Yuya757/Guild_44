import Constants from 'expo-constants';

/**
 * API service for face recognition and email suggestion
 */
interface FaceRecognitionResponse {
  status: 'success' | 'error';
  message: string;
  timestamp: string;
  faces: Array<{
    face_id: string;
    similarity: number;
    member_info: any;
  }>;
}

/**
 * 画像のフォーマットを検証する
 * @param base64Image - Base64エンコードされた画像データ
 * @returns 検証結果（true：検証OK、false：検証NG）
 */
function validateImageFormat(base64Image: string): boolean {
  // 正しい画像フォーマットで始まるかチェック
  const validPrefixes = ['data:image/jpeg;base64,', 'data:image/png;base64,', 'data:image/webp;base64,'];
  return validPrefixes.some(prefix => base64Image.startsWith(prefix));
}

/**
 * Performs face recognition on an image and returns matching face information
 * @param base64Image - Base64 encoded image data
 * @returns Promise with face recognition results
 */
export async function recognizeFacesFromImage(base64Image: string): Promise<FaceRecognitionResponse> {
  try {
    // フォーマット検証
    if (!validateImageFormat(base64Image)) {
      console.error('Invalid image format. Base64 data should start with data:image/[format];base64,');
      return {
        status: 'error',
        message: 'Invalid image format',
        timestamp: new Date().toISOString(),
        faces: []
      };
    }

    // サイズチェック（10MBを超える場合は警告）
    const estimatedSizeKB = Math.round((base64Image.length * 0.75) / 1024);
    if (estimatedSizeKB > 10240) {
      console.warn(`Image size is very large: ~${estimatedSizeKB} KB. This may cause performance issues.`);
    }
    
    // Get the API URL and key from environment variables or Constants
    const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'https://62az2hs957.execute-api.ap-northeast-1.amazonaws.com/prod/search';
    const apiKey = Constants.expoConfig?.extra?.apiKey || 'dSOovEKqYwgehvBr24g57tWpqJn1DfManBOt1WXd';

    // Base64文字列からデータ部分のみを抽出（'data:image/jpeg;base64,' などのプレフィックスを削除）
    const base64Data = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;

    console.log(`API request to: ${apiUrl}`);
    console.log(`Image size: ~${estimatedSizeKB} KB`);

    const requestBody = {
      image_base64str: base64Data,
      threshold: 80.0
    };
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API request failed: ${response.status}, Response body:`, errorText);
      throw new Error(`API request failed ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    console.error('Face recognition API error:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      faces: []
    };
  }
}

/**
 * Extract potential email suggestions from face recognition results
 * @param faces - Face recognition results
 * @returns Array of suggested emails
 */
export function getSuggestedEmails(faces: FaceRecognitionResponse['faces']): string[] {
  return faces
    .filter(face => face.member_info && face.member_info.Email?.S)
    .map(face => face.member_info.Email.S)
    .filter((email, index, self) => self.indexOf(email) === index); // Remove duplicates
}

/**
 * Extract face bounding box coordinates from face recognition results
 * @param faces - Face recognition results
 * @returns Array of face coordinates
 */
export function getFaceCoordinates(faces: FaceRecognitionResponse['faces']): Array<{
  faceId: string;
  boundingBox: {
    left: number;
    top: number;
    width: number;
    height: number;
  }
}> {
  return faces
    .filter(face => face.member_info && face.member_info.BoundingBox)
    .map(face => ({
      faceId: face.face_id,
      boundingBox: {
        left: parseFloat(face.member_info.BoundingBox.M.Left.N),
        top: parseFloat(face.member_info.BoundingBox.M.Top.N),
        width: parseFloat(face.member_info.BoundingBox.M.Width.N),
        height: parseFloat(face.member_info.BoundingBox.M.Height.N)
      }
    }));
} 