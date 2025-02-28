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
 * Performs face recognition on an image and returns matching face information
 * @param base64Image - Base64 encoded image data
 * @returns Promise with face recognition results
 */
export async function recognizeFacesFromImage(base64Image: string): Promise<FaceRecognitionResponse> {
  try {
    // Get the API URL and key from environment variables or Constants
    const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'https://62az2hs957.execute-api.ap-northeast-1.amazonaws.com/prod/search';
    const apiKey = Constants.expoConfig?.extra?.apiKey || 'dSOovEKqYwgehvBr24g57tWpqJn1DfManBOt1WXd';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        image_base64str: base64Image,
        threshold: 80.0
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
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