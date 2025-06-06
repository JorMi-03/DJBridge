package com.doublejoy.bridge;

import android.app.Activity;
import android.os.Build;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;

import org.json.JSONException;
import org.json.JSONObject;

import java.lang.ref.WeakReference;

public class DJWebViewMgr {
    private static String[] actionList;
    private static WeakReference<WebView> webViewRef;
    private static WeakReference<Activity> mainActivityRef;

    public static void initWebView(WebView webview, Activity activity, DJOnMessageReceived messageReceived) {
        webViewRef = new WeakReference<>(webview);
        mainActivityRef = new WeakReference<>(activity);
        WebSettings webSettings = webview.getSettings();
        webSettings.setJavaScriptEnabled(true);
        // 开启 DOM storage API 支持
        webSettings.setDomStorageEnabled(true);
        // 开启数据库存储 API 支持（部分旧版浏览器需要）
        webSettings.setDatabaseEnabled(true);
        webview.setWebViewClient(new DJWebViewClient());
        webview.setWebChromeClient(new DJWebChromeClient());
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
            webview.setWebContentsDebuggingEnabled(true);
        }
        // 启用硬件加速
        webview.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        DJWebViewJsBridge bridge = new DJWebViewJsBridge(messageReceived);
        webview.addJavascriptInterface(bridge,"DJAndroidBridge");
        // 开启 WebView 调试模式（仅 Android 4.4 及以上版本有效）
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
            webview.setWebContentsDebuggingEnabled(true);
        }
    }
    public static void setActions(String[] actions) {
        actionList = actions;
    }
    public static String[] getActions() {
        if (actionList == null) {
            return new String[0];
        } else {
            return actionList;
        }
    }
    public static void callJsBridge(String action,double data) {
        JSONObject param = new JSONObject();
        try {
            param.put("action",action);
            param.put("data",data);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        callJsBridgeToJson(param);
    }
    public static void callJsBridge(String action,int data) {
        JSONObject param = new JSONObject();
        try {
            param.put("action",action);
            param.put("data",data);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        callJsBridgeToJson(param);
    }
    public static void callJsBridge(String action,boolean data) {
        JSONObject param = new JSONObject();
        try {
            param.put("action",action);
            param.put("data",data);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        callJsBridgeToJson(param);
    }
    public static void callJsBridge(String action) {
        JSONObject param = new JSONObject();
        try {
            param.put("action",action);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        callJsBridgeToJson(param);
    }
    /**
     * 调用js方法
     * @param action 方法名 必须要注册到actionList中才可以使用
     * @param data 方法参数,json数据对象
     */
    public static void callJsBridge(String action,Object data) {
        JSONObject param = new JSONObject();
        try {
            param.put("action",action);
            param.put("data",data);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        callJsBridgeToJson(param);
    }
    private static void callJsBridgeToJson(JSONObject param) {
        Activity activity = mainActivityRef.get();
        if(activity == null) return;
        activity.runOnUiThread(() -> {
            WebView webView = webViewRef.get();
            if (webView == null) return;
            try {
                // 检查 action 是否存在
                if (param.isNull("action")) {
                    return;
                }
                String jsonString = param.toString();
                String jsCode = "javascript:DJAndroidBridgeToJs('" + jsonString.replace("'", "\\'") + "')";
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                    // Android 4.4 及以上版本使用 evaluateJavascript
                    webView.evaluateJavascript(jsCode, value -> {
                        // 处理 JavaScript 函数的返回值
                    });
                } else {
                    // Android 4.4 以下版本使用 loadUrl
                    webView.loadUrl(jsCode);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }
}
