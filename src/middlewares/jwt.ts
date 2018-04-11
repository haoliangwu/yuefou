import * as jwt from 'jsonwebtoken';
import { RequestHandler } from "express";

export const checkJwt: RequestHandler = function (req, res, next) {
  const Authorization = req.get('Authorization')

  // 如果有 Authorization 则进行 jwt 校验
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '')

    jwt.verify(token, process.env.APP_SECRET, function (err, decode) {
      if (err) {
        // TODO 错误格式需要封装为统一的 util 函数
        return res.status(401).json({
          code: 401,
          message: err
        });
      }

      next()
    })
  }

  // 如果没有则直接跳过校验
  next()
}