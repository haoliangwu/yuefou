declare module "*.json" {
  const value: any;
  export default value;
}

interface FileType {
  stream: ReadableStream
  path: string
  filename: string
  mimetype: string
  encoding: string
}

interface UploadPayload {
  file: FileType
  namespace?: string
}