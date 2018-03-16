## 创建活动
```
mutation createActivity($activity: CreateActivityInput){
  createActivity(activity: $activity) {
    id
  }
}

{
  "activity": {
      "title": "JEDI",
      "type": "HOST"
  }
}

```

## 参加活动
```
mutation {
  attendActivity(id: "cjetlqplm00u00120o6dkcaax"){
    id
  }
}
```

## 退出活动
```
mutation {
  quitActivity(id: "cjetlqplm00u00120o6dkcaax"){
    id
  }
}
```