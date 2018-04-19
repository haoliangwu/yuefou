import { RequestHandler } from "express";
import { getTempKeys, getAuthorization, getSTS } from "./qcloud-sts-auth-util";

// 配置
const config: any = {
  AppId: process.env.COS_APP_ID,
  Url: process.env.COS_URL || 'https://sts.api.qcloud.com/v2/index.php',
  Domain: process.env.COS_DOMAIN || 'sts.api.qcloud.com',
  // Proxy: 'http://dev-proxy.oa.com:8080',
  SecretId: process.env.COS_SECRET_ID, // 固定密钥
  SecretKey: process.env.COS_SECRET_KEY, // 固定密钥
  Bucket: process.env.COS_BUCKET,
  Region: process.env.COS_REGION,
  name: process.env.COS_NAME,
  AllowPrefix: '*', // 这里改成允许的路径前缀，这里可以根据自己网站的用户登录态判断允许上传的目录，例子：* 或者 a/* 或者 a.jpg
};

export const stsAuth: RequestHandler = function (req, res, next) {
  getSTS(config, (err, data) => {
    if (err) {
      res.status(400).json({
        ...err
      })
    } else {
      // const data = {
      //   Authorization: getAuthorization(tempKeys, req.method, req.query.pathname),
      //   XCosSecurityToken: tempKeys['credentials'] && tempKeys['credentials']['sessionToken'],
      // };

      res.status(200).json(data)
    }
  })
  // getTempKeys(config, function (err, tempKeys) {
  //   
  // });
}