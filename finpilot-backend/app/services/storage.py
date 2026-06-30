"""S3/MinIO storage wrapper."""
import uuid
import boto3
from app.core.config import settings


def get_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.S3_ENDPOINT_URL or None,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID or None,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY or None,
        region_name=settings.AWS_REGION,
    )


def upload_bytes(content: bytes, filename: str, user_id: str) -> str:
    key = f"uploads/{user_id}/{uuid.uuid4()}-{filename}"
    client = get_s3_client()
    client.put_object(Bucket=settings.S3_BUCKET_NAME, Key=key, Body=content)
    return key


def download_bytes(key: str) -> bytes:
    client = get_s3_client()
    obj = client.get_object(Bucket=settings.S3_BUCKET_NAME, Key=key)
    return obj["Body"].read()


def get_presigned_url(key: str, expires_in: int = 3600) -> str:
    client = get_s3_client()
    return client.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.S3_BUCKET_NAME, "Key": key},
        ExpiresIn=expires_in,
    )
