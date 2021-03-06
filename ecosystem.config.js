require('dotenv').config({ path: './.env' })

const isProdEnv = process.env.NODE_ENV === 'production'

const suffixProd = str => {
  if(isProdEnv) {
    return str + '(prod)'
  } else {
    return str
  }
}

module.exports = {

  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */

  apps: [
    {
      name: suffixProd('yuefou-graphql-server'),
      script: 'dist/index.js'
    },
    {
      name: suffixProd('yuefou-graphql-engine-server'),
      script: 'dist/engine.js'
    }
  ],
  deploy: {
    // TODO 等正式环境在配置
    "production": {
      "key": "~/.ssh/id_rsa",
      "user": "ubuntu",
      "host": "58.87.91.173",
      "ref": "origin/master",
      "repo": "git@github.com:haoliangwu/yuefou.git",
      "path": "/home/ubuntu/release/yuefou",
      "ssh_options": ["StrictHostKeyChecking=no", "PasswordAuthentication=no"],
      "post-deploy": "yarn install && yarn prod:deploy",
      "env": {
        "NODE_ENV": "production"
      }
    },
    "staging": {
      "key": "~/.ssh/id_rsa",
      "user": "ubuntu",
      "host": "58.87.91.173",
      "ref": "origin/staging",
      "repo": "git@github.com:haoliangwu/yuefou.git",
      "path": "/home/ubuntu/yuefou",
      "ssh_options": ["StrictHostKeyChecking=no", "PasswordAuthentication=no"],
      "post-deploy": "yarn install && yarn prod:deploy",
      "env": {
        "NODE_ENV": "staging"
      }
    }
  }
};
