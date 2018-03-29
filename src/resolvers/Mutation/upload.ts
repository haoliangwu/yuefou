import { createWriteStream } from 'fs'
import { resolve, join } from 'path';
import * as mkdirp from 'mkdirp'
import * as uuid from 'node-uuid';

import { Context, getUserId } from '../../utils'

const storeUpload = async ({ stream, filename }, namespace = '.'): Promise<any> => {
  const id = uuid.v4()
  const fileName = `${id}-${filename}`
  const fullPath = resolve(process.env.UPLOAD_DIR, namespace)

  mkdirp.sync(fullPath)

  return new Promise((resolve, reject) =>
    stream
      .pipe(createWriteStream(join(fullPath, fileName)))
      .on('finish', () => resolve({ id, path: fileName }))
      .on('error', reject),
  )
}

const recordFile = async ({ id, filename, mimetype, encoding, path }) => {
  return { id, filename, mimetype, encoding, path }
}


export const uploadMutation = {
  /*
   单个文件上传 
   */
  async singleUpload(parent, { file }, ctx: Context, info?) {
    const userId = getUserId(ctx)

    const { stream, filename, mimetype, encoding } = await file

    const { id, path } = await storeUpload({ stream, filename }, userId)

    return { id, filename, mimetype, encoding, path }
  },

  /* 
   多个文件上传
   */
  async multipleUpload(parent, { files }, ctx: Context, info?) {
    return Promise.all(files.map(file => {
      return uploadMutation.singleUpload(parent, { file }, ctx, info)
    }))
  }
}
