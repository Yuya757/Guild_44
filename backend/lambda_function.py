import json
import boto3 # type: ignore
from datetime import datetime
import base64
from typing import List, Dict, Union
from PIL import Image # type: ignore
from io import BytesIO

DYNAMODB_CLIENT = boto3.client('dynamodb')
REKOGNITION_CLIENT = boto3.client('rekognition')
COLLECTION_ID = 'face-recognition-authentication-collection'
MAX_FACES = 10
TABLE_NAME = 'Member'
INDEX_NAME = 'FaceId-index'

class RecognizeFaces:
    def __init__(self):
        self.rekognition_client = REKOGNITION_CLIENT
        self.dynamodb_client = DYNAMODB_CLIENT
        self.collection_id = COLLECTION_ID
        self.max_faces = MAX_FACES

    def make_timestamp(self) -> str:
        return datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    def create_response(self, message: str, face_info: List[Dict] = None) -> Dict:
        response = {
            'status': 'success' if face_info else 'error',
            'message': message,
            'timestamp': self.make_timestamp(),
            'faces': face_info if face_info else []
        }
        return {
            'statusCode': 200 if face_info else 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(response)
        }

    def decode_base64_to_binary(self, image_base64str: str) -> bytes:
        image_base64str = image_base64str.split(',')[-1]
        return base64.b64decode(image_base64str)

    def detect_faces(self, image_binary: bytes) -> List[Dict]:
        response = self.rekognition_client.detect_faces(
            Image={'Bytes': image_binary},
            Attributes=['DEFAULT']
        )
        return response.get('FaceDetails', [])

    def convert_image_to_binary(self, image: Image) -> bytes:
        """
        Convert a Pillow Image object to binary format.
        """
        img_byte_arr = BytesIO()
        image.save(img_byte_arr, format='JPEG')  # 画像形式はJPEGを指定（他の形式も可能）
        img_byte_arr.seek(0)  # 読み込み位置を先頭に戻す
        return img_byte_arr.read()  # バイナリデータを返す

    def mask_faces(self, image_binary: bytes, face_details: list) -> list:
        """
        Detect faces and create new images with one face per image.
        Each new image has only one face, and the rest is blacked out (masked).
        """
        # バイナリ形式の画像をPillow Imageオブジェクトに変換
        image = Image.open(BytesIO(image_binary))
        new_images = []

        for face in face_details:
            # Get the bounding box for the face
            box = face['BoundingBox']
            left = int(box['Left'] * image.width)
            top = int(box['Top'] * image.height)
            right = int((box['Left'] + box['Width']) * image.width)
            bottom = int((box['Top'] + box['Height']) * image.height)

            # Create a new image with the same size, filled with black (masked)
            new_image = Image.new('RGB', image.size, (0, 0, 0))  # 黒い画像

            # Crop the face from the original image
            face_image = image.crop((left, top, right, bottom))

            # Paste the face into the new image at the same position
            new_image.paste(face_image, (left, top))

            # Convert the new image to binary and append it to the list
            new_images.append(self.convert_image_to_binary(new_image))

        return new_images


    def search_faces_by_image(self, image_binary: bytes, threshold: float = 80.0) -> List[Dict]:
        response = self.rekognition_client.search_faces_by_image(
            CollectionId=self.collection_id,
            Image={'Bytes': image_binary},
            FaceMatchThreshold=threshold,
            MaxFaces=self.max_faces
        )
        return response.get('FaceMatches', [])

    def get_member_by_faceid(self, face_id: str) -> Union[Dict, None]:
        try:
            response = self.dynamodb_client.query(
                TableName=TABLE_NAME,
                IndexName=INDEX_NAME,
                KeyConditionExpression='FaceId = :face_id',
                ExpressionAttributeValues={':face_id': {'S': face_id}}
            )
            return response['Items'][0] if response['Items'] else None
        except Exception as e:
            print(f"[ERROR] DynamoDB query failed: {e}")
            return None

    def process_faces(self, image_binary: bytes, threshold: float = 80.0) -> Dict:
        face_details = self.detect_faces(image_binary)
        images = self.mask_faces(image_binary,face_details)
        
        face_infos = []

        for image in images:
            matches = self.search_faces_by_image(image, threshold)
            for match in matches:
                face_id = match['Face']['FaceId']
                member = self.get_member_by_faceid(face_id)
                if member:
                    face_infos.append({
                        'face_id': face_id,
                        'similarity': match['Similarity'],
                        'member_info': member,
                    })

        return self.create_response('Match found' if face_infos else 'No matching face found', face_infos)

search_post = RecognizeFaces()

def lambda_handler(event, _) -> Dict:
    try:
        body = json.loads(event['body'])
        image_base64str = body.get('image_base64str')
        threshold = body.get('threshold', 80.0)
        
        if not image_base64str:
            return search_post.create_response('Image data required')

        image_binary = search_post.decode_base64_to_binary(image_base64str)
        result = search_post.process_faces(image_binary, threshold)
        
        # 念のため、レスポンスのbodyもjson.dumpsでJSON文字列に変換する
        result['body'] = json.dumps(result['body'])  # JSON化する
        return result

    except Exception as e:
        print(f"[ERROR] {e}")
        return search_post.create_response(f'An error occurred: {e}')