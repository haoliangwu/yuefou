import * as crypto from 'crypto'
import * as request from 'request';

// 缓存临时密钥
let tempKeysCache = {
  policyStr: '',
  expiredTime: 0
};

// 获取随机数
export const getRandom = function (min, max) {
  return Math.round(Math.random() * (max - min) + min);
}
// json 转 query string
export const json2str = function (obj, notEncode?) {
  const arr = [];
  Object.keys(obj).sort().forEach(function (item) {
    let val = obj[item] || '';
    !notEncode && (val = val);
    arr.push(item + '=' + val);
  });
  return arr.join('&');
}

// 时间戳
export const getTimestamp = () => Number.parseInt(`${(+new Date()) / 1000}`)

// 获取查询参数签名
export const getSignature = (opt, key, method, domain) => {
  const formatString = method + domain + '/v2/index.php?' + json2str(opt, 1);
  const hmac = crypto.createHmac('sha1', key);
  const sign = hmac.update(new Buffer(formatString, 'utf8')).digest('base64');
  return sign;
}

// 获取 policy
export const getPolicy = config => {
  const ShortBucketName = config.Bucket.substr(0, config.Bucket.lastIndexOf('-'));

  const policy = {
    'version': '2.0',
    'statement': [{
      'action': [
        // 这里可以从临时密钥的权限上控制前端允许的操作
        // 'name/cos:*', // 这样写可以包含下面所有权限

        // // 列出所有允许的操作
        // // ACL 读写
        // 'name/cos:GetBucketACL',
        // 'name/cos:PutBucketACL',
        // 'name/cos:GetObjectACL',
        // 'name/cos:PutObjectACL',
        // // 简单 Bucket 操作
        // 'name/cos:PutBucket',
        // 'name/cos:HeadBucket',
        // 'name/cos:GetBucket',
        // 'name/cos:DeleteBucket',
        // 'name/cos:GetBucketLocation',
        // // Versioning
        // 'name/cos:PutBucketVersioning',
        // 'name/cos:GetBucketVersioning',
        // // CORS
        // 'name/cos:PutBucketCORS',
        // 'name/cos:GetBucketCORS',
        // 'name/cos:DeleteBucketCORS',
        // // Lifecycle
        // 'name/cos:PutBucketLifecycle',
        // 'name/cos:GetBucketLifecycle',
        // 'name/cos:DeleteBucketLifecycle',
        // // Replication
        // 'name/cos:PutBucketReplication',
        // 'name/cos:GetBucketReplication',
        // 'name/cos:DeleteBucketReplication',
        // // 删除文件
        // 'name/cos:DeleteMultipleObject',
        // 'name/cos:DeleteObject',
        // 简单文件操作
        'name/cos:PutObject',
        'name/cos:PostObject',
        'name/cos:AppendObject',
        'name/cos:GetObject',
        'name/cos:HeadObject',
        'name/cos:OptionsObject',
        'name/cos:PutObjectCopy',
        'name/cos:PostObjectRestore',
        // 分片上传操作
        'name/cos:InitiateMultipartUpload',
        'name/cos:ListMultipartUploads',
        'name/cos:ListParts',
        'name/cos:UploadPart',
        'name/cos:CompleteMultipartUpload',
        'name/cos:AbortMultipartUpload',
      ],
      'effect': 'allow',
      'principal': { 'qcs': ['*'] },
      'resource': [
        'qcs::cos:' + config.Region + ':uid/' + config.AppId + ':prefix//' + config.AppId + '/' + ShortBucketName + '/',
        'qcs::cos:' + config.Region + ':uid/' + config.AppId + ':prefix//' + config.AppId + '/' + ShortBucketName + '/' + config.AllowPrefix
      ]
    }]
  };

  return policy
}

export const camSafeUrlEncode = str => {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
}

export const getTempKeys = function (config, callback) {

  // 判断是否修改了 AllowPrefix
  if (config.AllowPrefix === '_ALLOW_DIR_/*') {
    callback({ error: '请修改 AllowPrefix 配置项，指定允许上传的路径前缀' });
    return;
  }

  // 定义绑定临时密钥的权限策略
  const ShortBucketName = config.Bucket.substr(0, config.Bucket.lastIndexOf('-'));
  const AppId = config.Bucket.substr(1 + config.Bucket.lastIndexOf('-'));
  const policy = getPolicy(config)

  const policyStr = JSON.stringify(policy);

  // 有效时间小于 30 秒就重新获取临时密钥，否则使用缓存的临时密钥
  if (tempKeysCache.expiredTime - Date.now() / 1000 > 30 && tempKeysCache.policyStr === policyStr) {
    callback(null, tempKeysCache);
    return;
  }

  const Action = 'GetFederationToken';
  const Nonce = getRandom(10000, 20000);
  const Timestamp = getTimestamp();
  const Method = 'GET';

  const params: any = {
    Action: Action,
    Nonce: Nonce,
    Region: '',
    SecretId: config.SecretId,
    Timestamp: Timestamp,
    durationSeconds: 7200,
    name: '',
    policy: policyStr,
  };

  params.Signature = encodeURIComponent(getSignature(params, config.SecretKey, Method, config.Domain))

  const opt = {
    method: Method,
    url: config.Url + '?' + json2str(params),
    rejectUnauthorized: false,
    headers: {
      Host: config.Domain
    },
    proxy: config.Proxy || '',
  };

  request(opt, function (err, response, body) {
    if (err) {
      return callback(err, null)
    } else {
      body = body && JSON.parse(body);
      const data = body.data;

      if (!!data) {
        tempKeysCache = data;
        tempKeysCache.policyStr = policyStr;

        callback(err, data);
      } else {
        callback(body)
      }
    }
  });
};

export const getAuthorization = function (keys, method, pathname) {

  const SecretId = keys.credentials.tmpSecretId;
  const SecretKey = keys.credentials.tmpSecretKey;

  // 整理参数
  const query = {};
  const headers = {};
  method = (method ? method : 'get').toLowerCase();
  pathname = pathname ? pathname : '/';
  pathname.indexOf('/') === -1 && (pathname = '/' + pathname);

  // 工具方法
  const getObjectKeys = function (obj) {
    const list = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        list.push(key);
      }
    }
    return list.sort();
  };

  const obj2str = function (obj) {
    let i, key, val;
    const list = [];
    const keyList = getObjectKeys(obj);
    for (i = 0; i < keyList.length; i++) {
      key = keyList[i];
      val = (obj[key] === undefined || obj[key] === null) ? '' : ('' + obj[key]);
      key = key.toLowerCase();
      key = camSafeUrlEncode(key);
      val = camSafeUrlEncode(val) || '';
      list.push(key + '=' + val)
    }
    return list.join('&');
  };

  // 签名有效起止时间
  const now = getTimestamp() - 1;
  const expired = now + 600; // 签名过期时刻，600 秒后

  // 要用到的 Authorization 参数列表
  const qSignAlgorithm = 'sha1';
  const qAk = SecretId;
  const qSignTime = now + ';' + expired;
  const qKeyTime = now + ';' + expired;
  const qHeaderList = getObjectKeys(headers).join(';').toLowerCase();
  const qUrlParamList = getObjectKeys(query).join(';').toLowerCase();

  // 签名算法说明文档：https://www.qcloud.com/document/product/436/7778
  // 步骤一：计算 SignKey
  const signKey = crypto.createHmac('sha1', SecretKey).update(qKeyTime).digest('hex');

  // 步骤二：构成 FormatString
  const formatString = [method.toLowerCase(), pathname, obj2str(query), obj2str(headers), ''].join('\n');

  // 步骤三：计算 StringToSign
  const stringToSign = ['sha1', qSignTime, crypto.createHash('sha1').update(formatString).digest('hex'), ''].join('\n');

  // 步骤四：计算 Signature
  const qSignature = crypto.createHmac('sha1', signKey).update(stringToSign).digest('hex');

  // 步骤五：构造 Authorization
  const authorization = [
    'q-sign-algorithm=' + qSignAlgorithm,
    'q-ak=' + qAk,
    'q-sign-time=' + qSignTime,
    'q-key-time=' + qKeyTime,
    'q-header-list=' + qHeaderList,
    'q-url-param-list=' + qUrlParamList,
    'q-signature=' + qSignature
  ].join('&');

  return authorization;
}