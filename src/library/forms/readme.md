# 表单逻辑

| 组件名         | 输入属性                                                                                                                                              | 事件                                       | 禁用       | 备注                                                                    |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ---------- | ----------------------------------------------------------------------- |
| input          | value`string`                                                                                                                                         | bindinput<br>bindfocus<br>bindblur         | disabled   | 事件比较多,可以对比参考<br>,text,number,idcard,digit,safe-password 类型 |
| textarea       | value`string`                                                                                                                                         | bindfocus<br>bindblur<br>bindinput         | disabled   |
| checkbox       | `checked` boolean                                                                                                                                     | 触发`checkbox-group`的 `change` 自身无事件 | `disabled` | `value`在触发时携带                                                     |
| checkbox-group |                                                                                                                                                       |                                            |            | 只用于`checkbox`                                                        |
| editor         |                                                                                                                                                       |                                            |            | 貌似不支持双向绑定                                                      |
| picker         | mode 对应, <br>selector:value`number`,<br>multiSelector:value`[]`,<br>time:value`string hh:mm`,<br>data:value`string YYYY-MM-DD`,<br>region:value`[]` | bindchange                                 | disabled   |
| picker-view    | value`number[]`组                                                                                                                                     | bindchange                                 | 无禁用     |
| radio          | checked                                                                                                                                               | 自身无事件                                 | disabled   | 需要配合                                                                |
| radio-group    |                                                                                                                                                       | bindchange                                 |            |
| slider         | value`number`                                                                                                                                         | bindchange                                 | disabled   |
| switch         | checked`boolean`                                                                                                                                      | bindchange                                 | disabled   |

# 开发状态

- input 已实现
- switch 已实现
- slider 已实现
- radio 已实现
- checkbox 已实现
- picker 已实现

# 待实现

- 双向绑定后,变更检测触发有点问题
