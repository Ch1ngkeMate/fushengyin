@echo off
chcp 65001 >nul
echo ==============================================
echo   浮生引 · APK 打包工具
echo   使用 Capacitor 将 PWA 封装为 Android APK
echo ==============================================
echo.
echo 前提条件：
echo   1. 已安装 Node.js (https://nodejs.org/)
echo   2. 已安装 Android Studio 和 Android SDK
echo   3. 环境变量 ANDROID_HOME 已配置
echo.
echo 按任意键开始打包，或关闭窗口取消...
pause >nul

cd /d "%~dp0"

echo [1/5] 初始化 npm 项目...
if not exist package.json (
  echo {"name":"fushengyin","version":"1.0.0","private":true} > package.json
)

echo [2/5] 安装 Capacitor...
call npm install @capacitor/core @capacitor/cli @capacitor/android --save 2>&1
if %errorlevel% neq 0 (
  echo npm 安装失败，请检查网络或 Node.js 安装
  pause
  exit /b 1
)

echo [3/5] 初始化 Capacitor 项目...
call npx cap init "浮生引" "com.fushengyin.game" --web-dir=. 2>&1

echo [4/5] 添加 Android 平台...
call npx cap add android 2>&1
if %errorlevel% neq 0 (
  echo Android 平台添加失败，请检查 Android SDK 配置
  pause
  exit /b 1
)

echo [5/5] 构建 APK...
call npx cap copy android 2>&1
call npx cap open android 2>&1

echo.
echo ==============================================
echo   Android Studio 已打开！
echo   在 Android Studio 中：
echo   1. 点击 Build -^> Build Bundle(s) / APK(s) -^> Build APK(s)
echo   2. APK 将在 app/build/outputs/apk/debug/ 中
echo ==============================================
echo.
echo 或者你也可以直接运行：
echo   cd android ^&^& gradlew assembleDebug
echo.
pause
