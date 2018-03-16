## 注册
```
mutation {
  signup(email: "foo@foo.com", password: "123456", name: "foo") {
    token
  }
}
```

## 登录
```
mutation {
  login(email: "admin@admin.com", password: "admin") {
    token
  }
}
```