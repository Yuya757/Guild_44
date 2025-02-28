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

// AWS顔認識APIの設定
const API_ENDPOINT = process.env.EXPO_PUBLIC_API_ENDPOINT || '';
const API_KEY = process.env.EXPO_PUBLIC_API_KEY || '';

// Default recognition configuration
export const DEFAULT_RECOGNITION_CONFIG = {
  threshold: 80.0,      // Default similarity threshold (%)
  maxFaces: 5,          // Default maximum number of faces to detect
  qualityFilter: 'AUTO', // AUTO, LOW, MEDIUM, HIGH
  attributeFilter: 'ALL' // ALL, DEFAULT, NONE
};

/**
 * Convert blob to base64
 * @param blob Blob object
 * @returns Promise with base64 encoded string
 */
const readFileAsBase64 = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Error reading file as base64'));
    };
    reader.readAsDataURL(blob);
  });
};

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
 * 画像から顔を認識するAPIを呼び出す関数
 * @param imageUri 画像のURI
 * @param config 認識設定（オプション）
 * @returns API応答
 */
export const recognizeFacesFromImage = async (
  imageUri: string, 
  config?: Partial<typeof DEFAULT_RECOGNITION_CONFIG>
) => {
  try {
    // Mock images are processed in the component
    if (imageUri === 'mock-image') {
      return Promise.resolve(null);
    }

    // Get the image data and convert to base64
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const base64 = await readFileAsBase64(blob);

    // Check if the image format is valid (should start with data:image/)
    if (!base64.startsWith('data:image/')) {
      console.error('Invalid image format');
      throw new Error('Invalid image format. Please use JPEG or PNG images.');
    }

    // Log image size for debugging
    const sizeInKB = Math.round(base64.length / 1024);
    console.log(`Image size: ${sizeInKB} KB`);
    if (sizeInKB > 1000) {
      console.warn('Large image detected. Consider resizing to improve performance.');
    }

    // Merge with default configuration
    const mergedConfig = {
      ...DEFAULT_RECOGNITION_CONFIG,
      ...config
    };

    // Log recognition parameters for debugging
    console.log('Recognition parameters:', mergedConfig);

    const requestBody = {
      image: base64,
      threshold: mergedConfig.threshold,
      max_faces: mergedConfig.maxFaces,
      quality_filter: mergedConfig.qualityFilter,
      attributes: mergedConfig.attributeFilter
    };

    const apiResponse = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify(requestBody)
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`API error: ${apiResponse.status} ${errorText}`);
    }

    const data = await apiResponse.json();
    return data;
  } catch (error) {
    console.error('Error in recognizeFacesFromImage:', error);
    throw error;
  }
};

/**
 * Extract potential email suggestions from face recognition results
 * @param faces - Face recognition results
 * @returns Array of suggested emails
 */
export function getSuggestedEmails(faces: FaceRecognitionResponse['faces']): string[] {
  return faces
    .filter(face => face.member_info && face.member_info.Email)
    .map(face => {
      // DynamoDB形式（{S: 'value'}）またはプレーンな文字列の両方に対応
      if (face.member_info.Email?.S) {
        return face.member_info.Email.S;
      }
      return typeof face.member_info.Email === 'string' ? face.member_info.Email : '';
    })
    .filter(email => email) // 空の文字列を除外
    .filter((email, index, self) => self.indexOf(email) === index); // Remove duplicates
}

/**
 * Extract face bounding box coordinates from face recognition results
 * @param faces - Face recognition results
 * @returns Array of face coordinates
 */
export function getFaceCoordinates(faces: FaceRecognitionResponse['faces']): any[] {
  return faces
    .filter(face => face.member_info && face.member_info.BoundingBox)
    .map(face => {
      // DynamoDB形式（{M: {Left: {N: '0.1'}, ...}}）に対応
      if (face.member_info.BoundingBox.M) {
        return {
          Left: parseFloat(face.member_info.BoundingBox.M.Left.N),
          Top: parseFloat(face.member_info.BoundingBox.M.Top.N),
          Width: parseFloat(face.member_info.BoundingBox.M.Width.N),
          Height: parseFloat(face.member_info.BoundingBox.M.Height.N)
        };
      }
      
      // プレーンなオブジェクト形式にも対応
      return {
        Left: face.member_info.BoundingBox.Left || 0,
        Top: face.member_info.BoundingBox.Top || 0,
        Width: face.member_info.BoundingBox.Width || 0,
        Height: face.member_info.BoundingBox.Height || 0
      };
    });
} 