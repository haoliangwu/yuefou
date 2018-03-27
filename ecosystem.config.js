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
  ]
};
