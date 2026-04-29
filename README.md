# 问集 - 调查问卷系统

一个专业的在线调查问卷平台，支持学术调研、市场研究等多种场景。

## 技术栈

- **前端**: Angular 17+
- **后端**: Java Spring Boot 3.2
- **数据库**: MySQL 8.0+
- **认证**: JWT (JSON Web Token)

## 项目结构

```
Investigation/
├── frontend/              # Angular 前端项目
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/      # 组件
│   │   │   ├── services/        # 服务
│   │   │   ├── models/          # 数据模型
│   │   │   ├── guards/          # 路由守卫
│   │   │   └── interceptors/    # 拦截器
│   │   ├── styles.css           # 全局样式
│   │   └── proxy.conf.json      # 代理配置
│   ├── package.json
│   └── angular.json
├── backend/               # Spring Boot 后端项目
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/wenji/survey/
│   │   │   │   ├── entity/          # 实体类
│   │   │   │   ├── repository/      # 数据访问层
│   │   │   │   ├── dto/             # 数据传输对象
│   │   │   │   ├── service/         # 业务逻辑层
│   │   │   │   ├── controller/      # 控制器
│   │   │   │   ├── security/        # 安全配置
│   │   │   │   ├── config/          # 配置类
│   │   │   │   └── exception/       # 异常处理
│   │   │   └── resources/
│   │   │       └── application.yml  # 应用配置
│   └── pom.xml
└── database/              # 数据库脚本
    └── init.sql           # 初始化脚本
```

## 功能特性

### 访客功能
- 浏览公开问卷列表
- 查看问卷详情
- 填写并提交问卷
- 提交后看到感谢页面

### 用户功能（登录后）
- 查看自己的提交记录
- 收藏问卷
- 管理个人收藏夹

### 管理员功能
- 创建/编辑/删除问卷
- 设计题目（支持单选、多选、填空、评分题）
- 发布或关闭问卷
- 查看每份问卷的收集结果
- 导出结果（CSV/Excel格式）

### 扩展功能
- 问卷模板：复制已有问卷快速创建
- 匿名填写开关
- 问卷截止时间设置
- 支持将问卷设为模板

## 环境要求

- **Node.js**: 18.x 或更高版本
- **Angular CLI**: 17.x
- **Java**: 17 或更高版本
- **Maven**: 3.6+
- **MySQL**: 8.0+

## 安装与启动

### 第一步：配置数据库

1. 启动 MySQL 服务

2. 创建数据库（可选，也可以让 JPA 自动创建）：
```sql
CREATE DATABASE wenji_survey DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. 或者执行初始化脚本：
```bash
mysql -u root -p < database/init.sql
```

4. 修改后端配置文件 `backend/src/main/resources/application.yml`：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/wenji_survey?useSSL=false&serverTimezone=Asia/Shanghai
    username: root           # 修改为您的MySQL用户名
    password: root           # 修改为您的MySQL密码
```

### 第二步：启动后端

1. 进入后端目录：
```bash
cd backend
```

2. 编译并启动：
```bash
# 使用 Maven
mvn clean install
mvn spring-boot:run

# 或者直接运行打包后的 jar
mvn clean package
java -jar target/survey-1.0.0.jar
```

后端服务将在 `http://localhost:8080` 启动。

**系统会自动创建默认账号：**
- 管理员：用户名 `admin`，密码 `admin123`
- 普通用户：用户名 `user`，密码 `user123`

### 第三步：启动前端

1. 进入前端目录：
```bash
cd frontend
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm start
```

前端应用将在 `http://localhost:4200` 启动。

## 验证步骤

### 1. 访问应用

打开浏览器访问：`http://localhost:4200`

### 2. 测试登录

使用默认账号登录：

**管理员账号：**
- 用户名：`admin`
- 密码：`admin123`

**普通用户账号：**
- 用户名：`user`
- 密码：`user123`

### 3. 测试管理员功能

1. 登录管理员账号
2. 点击顶部导航栏的「管理后台」
3. 点击「+ 创建问卷」
4. 填写问卷基本信息：
   - 标题：测试问卷
   - 描述：这是一个测试问卷
   - 勾选「允许匿名填写」
5. 添加题目：
   - 点击「+ 单选题」添加一道单选题
   - 点击「+ 多选题」添加一道多选题
   - 点击「+ 填空题」添加一道填空题
   - 点击「+ 评分题」添加一道评分题
6. 点击「保存并发布」
7. 在问卷列表中可以看到新创建的问卷状态为「已发布」

### 4. 测试访客填写问卷

1. 退出登录（点击右上角「退出登录」）
2. 点击「问卷列表」查看公开问卷
3. 点击刚才创建的测试问卷
4. 点击「开始填写问卷」
5. 回答所有题目
6. 点击「提交问卷」
7. 确认跳转到感谢页面

### 5. 测试结果查看和导出

1. 重新登录管理员账号
2. 进入「管理后台」
3. 在测试问卷的操作栏中点击「结果」
4. 查看统计数据（柱状图、评分统计等）
5. 点击「导出 CSV」或「导出 Excel」下载结果文件

### 6. 测试用户功能

1. 登录普通用户账号（user / user123）
2. 浏览问卷列表
3. 点击问卷的「🤍 收藏」按钮
4. 点击顶部导航栏的「收藏夹」查看已收藏的问卷
5. 点击「我的提交」查看自己的提交记录

### 7. 测试复制问卷功能

1. 登录管理员账号
2. 进入「管理后台」
3. 在任意问卷的操作栏中点击「复制」
4. 输入新问卷标题
5. 确认新问卷已创建

## API 接口说明

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 公开接口
- `GET /api/surveys/public` - 获取公开问卷列表
- `GET /api/surveys/templates` - 获取问卷模板列表
- `GET /api/surveys/{id}` - 获取问卷详情
- `POST /api/surveys/{id}/submit` - 提交问卷

### 用户接口（需登录）
- `GET /api/favorites` - 获取收藏列表
- `POST /api/favorites` - 添加收藏
- `DELETE /api/favorites/{surveyId}` - 取消收藏

### 管理员接口（需管理员权限）
- `GET /api/admin/surveys` - 获取所有问卷
- `POST /api/admin/surveys` - 创建问卷
- `PUT /api/admin/surveys/{id}` - 更新问卷
- `DELETE /api/admin/surveys/{id}` - 删除问卷
- `PUT /api/admin/surveys/{id}/publish` - 发布问卷
- `PUT /api/admin/surveys/{id}/close` - 关闭问卷
- `GET /api/admin/surveys/{id}/results` - 获取问卷统计结果
- `GET /api/admin/surveys/{id}/export` - 导出问卷结果
- `POST /api/admin/surveys/{id}/copy` - 复制问卷

## 数据库表结构

| 表名 | 说明 |
|------|------|
| users | 用户表 |
| surveys | 问卷表 |
| questions | 题目表 |
| question_options | 选项表 |
| survey_responses | 问卷回复表 |
| answers | 答案表 |
| favorites | 收藏表 |

## 注意事项

1. **JWT 密钥**：生产环境请修改 `application.yml` 中的 `jwt.secret` 为安全的随机字符串

2. **CORS 配置**：默认允许 `http://localhost:4200` 跨域访问，生产环境请修改 `SecurityConfig.java` 中的 CORS 配置

3. **数据初始化**：首次启动会自动创建管理员和测试用户，请在生产环境修改默认密码

## 常见问题

**Q: 后端启动报错 "Access denied for user 'root'@'localhost'"**
A: 请检查 MySQL 用户名密码是否正确，修改 `application.yml` 中的配置

**Q: 前端无法连接后端**
A: 请确保后端已在 8080 端口启动，检查代理配置 `proxy.conf.json`

**Q: 登录提示 "用户名或密码错误"**
A: 请使用正确的默认账号：admin/admin123 或 user/user123

**Q: 如何修改默认密码？**
A: 登录后可以通过数据库直接修改密码字段（需要使用 BCrypt 加密），或者在前端添加修改密码功能

## 许可证

MIT License
