package com.example.djbridge;

import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.constraintlayout.widget.ConstraintLayout;

import com.doublejoy.bridge.DJWebViewMgr;
import com.google.android.material.textfield.TextInputEditText;

import org.json.JSONException;
import org.json.JSONObject;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        this.setContentView(R.layout.main_layout);
        WebView mainWebView = this.findViewById(R.id.main_webview);
        WebSettings setting = mainWebView.getSettings();
        setting.setDomStorageEnabled(true);
        setting.setJavaScriptEnabled(true);
        mainWebView.loadUrl("https://www.google.com//");

        ConstraintLayout gameLayout = this.findViewById(R.id.game_layout);


        Button btn = this.findViewById(R.id.btn);
        btn.setOnClickListener(new View.OnClickListener(){
            @Override
            public void onClick(View v) {
                if (gameLayout.getChildCount() == 0) {
                    WebView webview = createGameWebView();
                    String[] applyActions = {
                            "showApp",
                            "hideApp",
                            "closeApp",};
                    DJWebViewMgr.initWebView(webview,MainActivity.this,(jsonObject) -> {
                        MainActivity.this.onDJOnMessage(jsonObject);
                    });
                    DJWebViewMgr.setActions(applyActions);
                    gameLayout.addView(webview);
                    // 这里根据自己的实际情况填对应的地址
                    webview.loadUrl("http://10.0.2.2/bridge-example/");
                    hideDJWebView();
                } else {
                    Toast.makeText(MainActivity.this,"游戏 WebView 已存在", Toast.LENGTH_SHORT).show();
                }
            }
        });

        TextInputEditText input = this.findViewById(R.id.input);
        input.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
                // 文本改变前触发，可在此记录改变前的文本状态
            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                // 文本改变时触发，可获取当前正在改变的文本内容
            }

            @Override
            public void afterTextChanged(Editable s) {
                String inputText = s.toString();
                try {
                    DJWebViewMgr.callJsBridge("setMessageText",inputText);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        });
    }
    public void onDJOnMessage(JSONObject jsonObject) {
        String action;
        Object data;
        try {
            action = (String) jsonObject.get("action");
            if (jsonObject.isNull("data") == false) {
                data = jsonObject.get("data");
            }
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }
        if (action == null) return;
        MainActivity.this.runOnUiThread(()-> {
            switch (action) {
                case "loadEnd":
                case "showApp":
                    showDJWebView();
                    break;
                case "closeApp":
                    closeDJWebView();
                    break;
                case "hideApp":
                    hideDJWebView();
                    break;
            }
        });
    }
    private void hideDJWebView() {
        ConstraintLayout gameLayout = this.findViewById(R.id.game_layout);
        WebView webview =  (WebView)gameLayout.getChildAt(0);
        if (webview == null) return;
        webview.setVisibility(View.INVISIBLE);

    }
    private void showDJWebView() {
        ConstraintLayout gameLayout = this.findViewById(R.id.game_layout);
        WebView webview =  (WebView)gameLayout.getChildAt(0);
        if (webview == null) return;
        webview.setVisibility(View.VISIBLE);
    }
    private void closeDJWebView() {
        ConstraintLayout gameLayout = this.findViewById(R.id.game_layout);
        WebView webview =  (WebView)gameLayout.getChildAt(0);
        if (webview == null) return;
        webview.onPause();
        webview.loadUrl("about:blank");
        if (webview.getParent() != null) {
            ((ViewGroup) webview.getParent()).removeView(webview);
        }
        webview.destroy();
    }
    private WebView createGameWebView() {
        WebView webview = new WebView(MainActivity.this);
        ConstraintLayout.LayoutParams webViewParams = new ConstraintLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        );
        webViewParams.topToBottom = ConstraintLayout.LayoutParams.PARENT_ID;
        webViewParams.bottomToBottom = ConstraintLayout.LayoutParams.PARENT_ID;
        webViewParams.startToStart = ConstraintLayout.LayoutParams.PARENT_ID;
        webViewParams.endToEnd = ConstraintLayout.LayoutParams.PARENT_ID;
        webview.setLayoutParams(webViewParams);
        webview.clearCache(false);
        return webview;
    }

}
