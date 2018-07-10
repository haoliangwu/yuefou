## YueFou
使用 GraphQL 的 DEMO 项目

## Back-end stack
* database: mysql 5.7.1
* database api proxy layer: prisma
* graphql server: nodejs + graphql-yoga
* static server: nginx 1.10.3(ubuntu)
* track: apollo-engine

## Front-end stack
### common
* cloud storage: 腾讯云

### [web](https://github.com/haoliangwu/yuefou-webapp)

> YueFou web 应用

* mvvm framework: angular 5
* store management: apollo-client
* sdk: cos-nodejs-v5-sdk

### [wx-mini-app](https://github.com/haoliangwu/yuefou-wx)

> YueFou 小程序

* mvvm framework: wepy
* sdk: wafer-client-sdk

### [wx-mini-app-server](https://github.com/haoliangwu/yuefou-wx-miniapp-server)

> YueFou 小程序中间层服务

* proxy server: koa 2
* sdk: wafer-nodejs-sdk

## [flutter](https://github.com/haoliangwu/yuefou-flutter)

> YueFou ios 和 andriod

* flutter-material
* dart-graphql-client

## DevOps
* pm2 