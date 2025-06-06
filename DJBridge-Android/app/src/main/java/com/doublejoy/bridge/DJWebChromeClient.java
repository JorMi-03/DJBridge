package com.doublejoy.bridge;

import android.util.Log;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;

public class DJWebChromeClient extends WebChromeClient {
    @Override
    public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
        // 获取日志级别、消息内容、行号和源文件信息
        String message = consoleMessage.message();
        String sourceId = consoleMessage.sourceId();
        int lineNumber = consoleMessage.lineNumber();
        ConsoleMessage.MessageLevel level = consoleMessage.messageLevel();
        String tag = "DJWebViewConsole";
        // 根据不同日志级别输出到 Android 日志
        switch (level) {
            case DEBUG:
                Log.d(tag, "DEBUG: " + message + " (Line " + lineNumber + " in " + sourceId + ")");
                break;
            case ERROR:
                Log.e(tag, "ERROR: " + message + " (Line " + lineNumber + " in " + sourceId + ")");
                break;
            case LOG:
                Log.i(tag, "LOG: " + message + " (Line " + lineNumber + " in " + sourceId + ")");
                break;
            case WARNING:
                Log.w(tag, "WARNING: " + message + " (Line " + lineNumber + " in " + sourceId + ")");
                break;
            case TIP:
                Log.v(tag, "TIP: " + message + " (Line " + lineNumber + " in " + sourceId + ")");
                break;
        }
        return true;
    }
}
