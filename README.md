## YueFou
使用 GraphQL 的 DEMO 项目

## Common stack
* cloud server: 腾讯云
* cloud storage: 腾讯云
* devOps: pm2

## Back-end stack
* database: mysql 5.7.1
* database api proxy layer: prisma
* graphql server: nodejs + graphql-yoga
* static server: nginx 1.10.3(ubuntu)
* track: apollo-engine

## Front-end stack

### [web](https://github.com/haoliangwu/yuefou-webapp)

> YueFou web 应用

* mvvm framework: angular 5
* graphql-client: apollo-angular-client
* store management: apollo-angular-client
* sdk: cos-nodejs-v5-sdk

### [wx-mini-app](https://github.com/haoliangwu/yuefou-wx)

> YueFou 小程序

* mvvm framework: wepy
* sdk: wafer-client-sdk
* graphql-client: wx-mini-app-server

### [wx-mini-app-server](https://github.com/haoliangwu/yuefou-wx-miniapp-server)

> YueFou 小程序 GraphQL 中间层服务

* proxy server: koa 2
* sdk: wafer-nodejs-sdk
* graphql-client: apollo-nodejs-client

#### [flutter](https://github.com/haoliangwu/yuefou-flutter)

> YueFou ios 和 andriod

* sdk: flutter && flutter-material
* graphql-client: dart-graphql-client