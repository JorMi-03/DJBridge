## <div align="center"><b><a href="README.md">English</a> | <a href="README_CN.md">简体中文</a></b></div>

### Project Overview
DJBridge is a powerful API SDK designed to provide a unified interface for different platforms (iOS, Android, Web), making it convenient for developers to call Web-related functions across various platforms. This bridge facilitates seamless communication between native applications and web content.

### Directory Structure
This project contains several key directories, each serving a specific purpose:

- DJBridge-iOS : Contains iOS platform-related code for implementing DJBridge functionality on iOS devices.
- DJBridge-Android : Contains Android platform-related code for implementing DJBridge functionality on Android devices.
- DJBridge-Example : Contains web example code to help developers quickly understand DJBridge's interaction logic.
- DJBridge-Web : Contains Web-side related code for implementing DJBridge functionality on the Web platform.
### Framework Features
DJBridge offers the following key features:

- Cross-platform Support : Simultaneously supports iOS, Android, and Web platforms, reducing duplicate development work.
- Simple and Easy to Use : Provides concise API interfaces, lowering the learning curve for developers.
- Event-based Communication : Uses an event-driven architecture for efficient message passing between platforms.
- Flexible Integration : Can be easily integrated into existing projects with minimal configuration.
### Workflow
The main workflow of DJBridge is as follows:

1. Initialization : Initialize the DJBridge framework when the application starts.
2. Register Callbacks : Developers register callback functions to receive messages from the DJ service.
3. Call APIs : Call the API interfaces provided by DJBridge to interact with the DJ service when needed.
4. Handle Callbacks : Execute pre-registered callback functions when messages are received from the DJ service.
### Usage Example Web Side (JavaScript/TypeScript)
``` ts
// Import DJBridge
import { DJBridge } from './lib/DJBridge';

// Register event listeners
DJBridge.event.on(DJBridge.EventType.loadEnd, () => {
  console.log('Load ended');
}, this);

// Send message to native platform
DJBridge.sendMessage('actionName', { key: 'value' });
``` 
IOS Side (Swift)
``` swift
// Initialize DJWebView
let djWebView = DJWebView(frame: view.bounds)
view.addSubview(djWebView)

// Set callback handler
djWebView.onMessageReceived = { action, data in
  switch action {
  case "loadEnd":
    // Handle load end event
    break
  case "closeApp":
    // Handle close app event
    break
  default:
    break
  }
}

// Load URL
if let url = URL(string: "https://example.com") {
  djWebView.loadUrl(url)
}
``` 
Android Side (Java)
``` java
// Call JavaScript from Android
DJWebViewMgr.callJsBridge("actionName", data);

// Handle messages from JavaScript
@Override
public void onDJOnMessage(JSONObject jsonObject) {
  String action;
  Object data;
  try {
    action = (String) jsonObject.get("action");
    if (!jsonObject.isNull("data")) {
      data = jsonObject.get("data");
    }
  } catch (JSONException e) {
    e.printStackTrace();
    return;
  }
  
  switch (action) {
    case "loadEnd":
      // Handle load end event
      break;
    case "closeApp":
      // Handle close app event
      break;
  }
}
```

# DJBridge Environment Configuration Documentation

## 1. DJBridge-iOS Environment Configuration
### Development Environment Requirements
- Xcode (latest version recommended)
- Swift 5.0
- iOS deployment target: iOS 13.0+ (inferred from project configuration)
### Project Structure
```
DJBridge-iOS/
└── djbridge/
    ├── djbridge.xcodeproj/  # Xcode project files
    └── djbridge/            # Source code directory
        ├── AppDelegate.swift
        ├── SceneDelegate.swift
        ├── ViewController.swift
        ├── Assets.xcassets/
        ├── Base.lproj/
        ├── Info.plist
        └── djbridge/        # Core library code
```
### Key Configurations
- **Info.plist Configuration**:
  - NSAllowsArbitraryLoads enabled, allowing the application to load arbitrary network content
  - Standard UIKit application scene configuration
  - Multiple scene mode not supported
### Build and Run
1. Open the djbridge.xcodeproj file with Xcode
2. Select the target device or simulator
3. Click the run button or use the Cmd+R shortcut to build and run the project

## 2. DJBridge-Android Environment Configuration
### Development Environment Requirements
- Android Studio (latest version recommended)
- Gradle version: Using the project's configured Gradle Wrapper (8.1.3)
- JDK version: Compatible with Java 8
### Project Structure
```
DJBridge-Android/
├── app/                    # Application module
│   ├── build.gradle        # Application-level build configuration
│   └── src/
│       └── main/           # Main source code
│           ├── java/       # Java code
│           ├── res/        # Resource files
│           └── AndroidManifest.xml
├── build.gradle            # Project-level build configuration
├── gradle.properties       # Gradle properties configuration
└── settings.gradle         # Gradle settings
```
### Key Configurations
- **Build Configuration**:
  - Compile SDK version: 34 (Android 14)
  - Minimum SDK version: 21 (Android 5.0 Lollipop)
  - Target SDK version: 34 (Android 14)
  - Using AndroidX libraries

- **Dependencies**:
  ```gradle
  dependencies {
      implementation 'androidx.appcompat:appcompat:1.6.1'
      implementation 'com.google.android.material:material:1.12.0'
      implementation 'androidx.constraintlayout:constraintlayout:2.2.1'
      // Test dependencies
      testImplementation 'junit:junit:4.13.2'
      androidTestImplementation 'androidx.test.ext:junit:1.2.1'
      androidTestImplementation 'androidx.test.espresso:espresso-core:3.6.1'
  }
  ```
### Build and Run
1. Open the DJBridge-Android directory with Android Studio
2. Wait for Gradle synchronization to complete
3. Select the target device or simulator
4. Click the run button or use the Shift+F10 shortcut to build and run the project

## 3. DJBridge-Web Environment Configuration
### Development Environment Requirements
- Node.js (v18.0.0 or higher recommended)
- npm or yarn package manager
### Project Structure
```
DJBridge-Web/
├── src/                    # Source code directory
│   ├── core/               # Core functionality
│   │   └── EventTarget.ts
│   ├── lib/                # Library code
│   │   └── DJBridge.ts
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Entry file
├── public/                 # Static resources
├── package.json           # Project configuration and dependencies
├── tsconfig.json          # TypeScript configuration
├── tsconfig.app.json      # Application TypeScript configuration
├── tsconfig.node.json     # Node TypeScript configuration
└── vite.config.ts         # Vite configuration
```
### Key Configurations
- **Dependencies**:
  ```json
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.25.0",
    "@types/react": "^19.1.2",
    "@types/react-dom": "^19.1.2",
    "@vitejs/plugin-react": "^4.4.1",
    "eslint": "^9.25.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.19",
    "globals": "^16.0.0",
    "typescript": "~5.8.3",
    "typescript-eslint": "^8.30.1",
    "vite": "^6.3.5"
  }
  ```

- **TypeScript Configuration**:
  - Target ECMAScript version: ES2020
  - Using React JSX
  - Strict mode enabled
  - Module resolution strategy: bundler

- **Build Tools**:
  - Using Vite as the build tool and development server
  - Using React plugin
### Installation and Running
1. Install dependencies:
   ```bash
   cd DJBridge-Web
   npm install
   ```

2. Run in development mode:
   ```bash
   npm run dev
   ```

3. Build production version:
   ```bash
   npm run build
   ```

4. Preview build results:
   ```bash
   npm run preview
   ```
