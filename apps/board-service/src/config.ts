import { loadServiceConfig, readEnv, readNumberEnv } from "@aicloud/shared-config";

export const serviceConfig = loadServiceConfig("board-service", 8083);

export const boardConfig = {
  jwtSecret: readEnv("JWT_SECRET"),
  s3BucketName: readEnv("S3_BUCKET_NAME"),
  s3PostImagePrefix: readEnv("S3_POST_IMAGE_PREFIX", "board/posts/"),
  s3PresignedUrlExpireSeconds: readNumberEnv("S3_PRESIGNED_URL_EXPIRE_SECONDS", 300),
  cloudfrontDomain: readEnv("CLOUDFRONT_DOMAIN")
};
