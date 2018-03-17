import { createWriteStream } from 'fs'
import { resolve } from 'path';
import * as mkdirp from 'mkdirp'
import * as uuid from 'node-uuid';

import { Context, getUserId } from '../../utils'

const storeUpload = async ({ stream, filename }, namespace = '.'): Promise<any> => {
  const id = uuid.v4()
  const folder = resolve(process.env.UPLOAD_DIR, namespace)
  const path = `${folder}/${id}-${filename}`

  mkdirp.sync(folder)

  return new Promise((resolve, reject) =>
    stream
      .pipe(createWriteStream(path))
      .on('finish', () => resolve({ id, path }))
      .on('error', reject),
  )
}

const recordFile = async ({ id, filename, mimetype, encoding, path }) => {
  return { id, filename, mimetype, encoding, path }
}


export const upload = {
  /*
   单个文件上传 
   */
  async singleUpload(parent, { file }, ctx: Context, info) {
    const userId = getUserId(ctx)

    const { stream, filename, mimetype, encoding } = await file

    const { id, path } = await storeUpload({ stream, filename }, userId)

    return recordFile({ id, filename, mimetype, encoding, path })
  },

  /* 
   多个文件上传
   */
  async multipleUpload(parent, { files }, ctx: Context, info) {
    return Promise.all(files.map(file => {
      return upload.singleUpload(parent, { file }, ctx, info)
    }))
  }
}
