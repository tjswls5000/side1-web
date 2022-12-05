export const s3Bucket = "moagudok"
export const s3Url = `https://${s3Bucket}.amazonaws.com/`
export const createImageUrl = (path?: string | null) => (path ? s3Url + path : undefined)
