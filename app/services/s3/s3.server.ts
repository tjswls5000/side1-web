import type aws from "aws-sdk/clients/all"
import { S3 } from "aws-sdk/clients/all"

import { AWS_ACCESS_KEY_USER, AWS_SECRET_KEY_USER } from "~/lib/config.server"
import { s3Bucket, s3Url } from "~/lib/s3"

// S3
const S3_CONFIG: aws.S3.ClientConfiguration = {
  signatureVersion: "v4",
  region: "ap-northeast-2",
  credentials:
    AWS_ACCESS_KEY_USER && AWS_SECRET_KEY_USER
      ? {
          accessKeyId: "AKIAQUH3EHARPOWGDGMI",
          secretAccessKey: "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",
        }
      : undefined,
}

// AWS
export const s3 = new S3(S3_CONFIG)

interface S3SignedUrlData {
  key: string
  contentType: string
}
export function createSignedUrl({ key, contentType }: S3SignedUrlData) {
  const s3Params = {
    Bucket: s3Bucket,
    Key: key,
    Expires: 60,
    ContentType: contentType,
    ACL: "public-read",
  }
  return { uploadUrl: s3.getSignedUrl("putObject", s3Params), key, url: s3Url + key }
}
