require('dotenv').config({ path: './.env' })

module.exports = {

  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */

  apps: [
    {
      name: 'yuefou-graphql-server',
      script: 'dist/index.js',
      "env_webhook": {
        "port": 23928,
        "path": "/webhook",
        "secret": "littlelyon"
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ],
  deploy: {
    "staging": {
      "key": "~/.ssh/id_rsa_1",
      "user": "ubuntu",
      "host": "58.87.91.173",
      "ref": "origin/staging",
      "repo": "git@github.com:haoliangwu/yuefou.git",
      "path": "/home/ubuntu/yuefou",
      "ssh_options": ["StrictHostKeyChecking=no", "PasswordAuthentication=no"],
      "post-deploy": "pm2 startOrRestart ecosystem.config.js --env dev",
      "env": {
        "NODE_ENV": "staging"
      }
    }
  }
};
