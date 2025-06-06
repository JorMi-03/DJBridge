## <div align="center"><b><a href="README.md">English</a> | <a href="README_CN.md">简体中文</a></b></div>

### 项目概述
DJBridge 是一个强大的 API SDK，旨在为不同平台（如 iOS、Android、Web）提供统一的接口，方便开发者在不同平台上调用Web端相关的功能。这个桥接工具促进了原生应用和网页内容之间的无缝通信。

### 项目目录介绍
本项目包含多个关键目录，各目录的主要作用如下：

- DJBridge-iOS ：包含 iOS 平台相关代码，用于实现 DJBridge 在 iOS 设备上的功能。
- DJBridge-Android ：包含 Android 平台相关代码，用于实现 DJBridge 在 Android 设备上的功能。
- DJBridge-Example ：包含网页的示例代码，方便开发者快速了解 DJBridge 的交互逻辑。
- DJBridge-Web : 包含Web端相关代码，用于实现DJBridge在Web端的功能。
### 框架特点
DJBridge 具有以下特点：

- 跨平台支持 ：同时支持 iOS、Android 和 Web 平台，减少开发者的重复开发工作。
- 简单易用 ：提供简洁的 API 接口，降低开发者的学习成本。
- 基于事件的通信 ：使用事件驱动架构，实现平台间高效的消息传递。
- 灵活集成 ：可以轻松集成到现有项目中，配置简单。
### 工作流程
以下是 DJBridge 的主要工作流程：

1. 初始化 ：在应用启动时，初始化 DJBridge 框架。
2. 注册回调 ：开发者注册需要处理的回调函数，以便接收来自DJ服务的消息。
3. 调用 API ：在需要的时候，调用 DJBridge 提供的 API 接口，与DJ服务进行交互。
4. 处理回调 ：当接收到DJ服务的消息时，执行预先注册的回调函数。
### 使用示例 Web端 (JavaScript/TypeScript)
``` ts
// 导入 DJBridge
import { DJBridge } from './lib/DJBridge';

// 注册事件监听器
DJBridge.event.on(DJBridge.EventType.loadEnd, () => {
  console.log('加载结束');
}, this);

// 向原生平台发送消息
DJBridge.sendMessage('actionName', { key: 'value' });
``` 
iOS端 (Swift)
``` swift
// 初始化 DJWebView
let djWebView = DJWebView(frame: view.bounds)
view.addSubview(djWebView)

// 设置回调处理器
djWebView.onMessageReceived = { action, data in
  switch action {
  case "loadEnd":
    // 处理加载结束事件
    break
  case "closeApp":
    // 处理关闭应用事件
    break
  default:
    break
  }
}

// 加载URL
if let url = URL(string: "https://example.com") {
  djWebView.loadUrl(url)
}
``` 
Android端 (Java)
``` java
// 从Android调用JavaScript
DJWebViewMgr.callJsBridge("actionName", data);

// 处理来自JavaScript的消息
@Override
public void onDJOnMessage(JSONObject jsonObject) {
  String action;
  Object data;
  try {
    action = (String) jsonObject.get("action");
    if (!jsonObject.isNull("data")) {
      data = jsonObject.get("data");
    }
  } catch (JSONException e) {
    e.printStackTrace();
    return;
  }
  
  switch (action) {
    case "loadEnd":
      // 处理加载结束事件
      break;
    case "closeApp":
      // 处理关闭应用事件
      break;
  }
}
```

# DJBridge 项目环境配置文档

## 1. DJBridge-iOS 环境配置
### 开发环境要求
- Xcode（推荐最新版本）
- Swift 5.0
- iOS 部署目标：iOS 13.0+（根据项目配置推断）
### 项目结构
```
DJBridge-iOS/
└── djbridge/
    ├── djbridge.xcodeproj/  # Xcode 项目文件
    └── djbridge/            # 源代码目录
        ├── AppDelegate.swift
        ├── SceneDelegate.swift
        ├── ViewController.swift
        ├── Assets.xcassets/
        ├── Base.lproj/
        ├── Info.plist
        └── djbridge/        # 核心库代码
```
### 关键配置
- Info.plist 配置 ：
  - 已启用 NSAllowsArbitraryLoads ，允许应用加载任意网络内容
  - 使用标准的 UIKit 应用场景配置
  - 不支持多场景模式
### 构建与运行
1. 使用 Xcode 打开 djbridge.xcodeproj 文件
2. 选择目标设备或模拟器
3. 点击运行按钮或使用快捷键 Cmd+R 构建并运行项目

## 2. DJBridge-Android 环境配置
### 开发环境要求
- Android Studio（推荐最新版本）
- Gradle 版本：使用项目配置的 Gradle Wrapper（8.1.3）
- JDK 版本：兼容 Java 8
### 项目结构
```
DJBridge-Android/
├── app/                    # 应用模块
│   ├── build.gradle        # 应用级构建配置
│   └── src/
│       └── main/           # 主要源代码
│           ├── java/       # Java 代码
│           ├── res/        # 资源文件
│           └── AndroidManifest.xml
├── build.gradle            # 项目级构建配置
├── gradle.properties       # Gradle 属性配置
└── settings.gradle         # Gradle 设置
```
### 关键配置
- 构建配置 ：
  
  - 编译 SDK 版本：34（Android 14）
  - 最低 SDK 版本：21（Android 5.0 Lollipop）
  - 目标 SDK 版本：34（Android 14）
  - 使用 AndroidX 库

  依赖项 ：

```
dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.
    material:material:1.12.0'
    implementation 'androidx.
    constraintlayout:constraintlayout:2.2.1'
    // 测试依赖
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.
    2.1'
    androidTestImplementation 'androidx.test.
    espresso:espresso-core:3.6.1'
}
```
### 构建与运行
1. 使用 Android Studio 打开 DJBridge-Android 目录
2. 等待 Gradle 同步完成
3. 选择目标设备或模拟器
4. 点击运行按钮或使用快捷键 Shift+F10 构建并运行项目

## 3. DJBridge-Web 环境配置
### 开发环境要求
- Node.js（推荐 v18.0.0 或更高版本）
- npm 或 yarn 包管理器
### 项目结构
```
DJBridge-Web/
├── src/                    # 源代码目录
│   ├── core/               # 核心功能
│   │   └── EventTarget.ts
│   ├── lib/                # 库代码
│   │   └── DJBridge.ts
│   ├── App.tsx            # 主应用组件
│   └── main.tsx           # 入口文件
├── public/                 # 静态资源
├── package.json           # 项目配置和依赖
├── tsconfig.json          # TypeScript 配置
├── tsconfig.app.json      # 应用 TypeScript 配置
├── tsconfig.node.json     # Node TypeScript 配置
└── vite.config.ts         # Vite 配置
```
### 关键配置
- 依赖项 ：

```
"dependencies": {
  "react": "^19.1.0",
  "react-dom": "^19.1.0"
},
"devDependencies": {
  "@eslint/js": "^9.25.0",
  "@types/react": "^19.1.2",
  "@types/react-dom": "^19.1.2",
  "@vitejs/plugin-react": "^4.4.1",
  "eslint": "^9.25.0",
  "eslint-plugin-react-hooks": "^5.2.0",
  "eslint-plugin-react-refresh": "^0.4.19",
  "globals": "^16.0.0",
  "typescript": "~5.8.3",
  "typescript-eslint": "^8.30.1",
  "vite": "^6.3.5"
}
```
- TypeScript 配置 ：
  - 目标 ECMAScript 版本：ES2020
  - 使用 React JSX
  - 严格模式启用
  - 模块解析策略：bundler
- 构建工具 ：
  - 使用 Vite 作为构建工具和开发服务器
  - 使用 React 插件
### 安装与运行
1. 安装依赖：
    ```
    cd DJBridge-Web
    npm instal
    ```
2. 开发模式运行：
    ```
    npm run dev
    ```
3. 构建生产版本：
    ```
    npm run build
    ```
4. 预览构建结果：
    ```
    npm run preview
    ```