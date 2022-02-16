## 自定义主题

:::tip
推荐使用 qm-vue-cli 脚手架，架构中开放了修改主题色的入口。
:::

### qm-vue-cli 脚手架

```bash
# 修改 config/index.js 文件
primaryColor: '#409eff'
```

### 改变 SCSS 变量

新建一个样式文件，例如 `design-variables.scss`，写入以下内容：

```javascript
/* 改变主题色变量 */
$primary-color: #409eff;

@import '@jiaozhiye/qm-design/lib/style/src/index';
```

之后，在项目的入口文件中，直接引入以上样式文件即可：

```javascript
import Vue from 'vue';
import QmDesign from '@jiaozhiye/qm-design';
import App from './App.vue';

// 引入自定义样式表
import './design-variables.scss';

const app = createApp(App);
app.use(QmDesign);
```
