import * as R from 'ramda';

import { createWriteStream } from 'fs'
import { resolve, join } from 'path';
import * as mkdirp from 'mkdirp'
import * as rimraf from 'rimraf';
import * as uuid from 'node-uuid';

import { Context, getUserId } from '../../utils'

// cos.sliceUploadFile({
//   Bucket: 'test',
//   Region: 'ap-guangzhou',
//   Key: '1.zip',
//   FilePath: './1.zip'
// }, function (err, data) {
//   console.log(err, data);
// });

export const removeUpload = async ({ filename }, namespace = '.') => {
  const fullPath = resolve(process.env.UPLOAD_DIR, namespace, filename)

  return new Promise((resolve, reject) => {
    rimraf(fullPath, function (err) { // 删除当前目录下的 test.txt
      if(err) reject(err)
      else resolve(fullPath)
    });
  })
}

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
  async singleUpload(parent, { file, namespace = null }: UploadPayload, ctx: Context, info?) {
    const userId = getUserId(ctx)

    namespace = R.defaultTo(userId, namespace)

    const { stream, filename, mimetype, encoding } = await file

    const { id, path } = await storeUpload({ stream, filename }, namespace)

    return { id, filename, mimetype, encoding, path }
  },

  /* 
   多个文件上传
   */
  async multipleUpload(parent, { files, namespace = null }, ctx: Context, info?) {
    return Promise.all(files.map(file => {
      return uploadMutation.singleUpload(parent, { file, namespace }, ctx, info)
    }))
  }
}
