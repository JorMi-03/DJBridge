package com.doublejoy.bridge;

import android.webkit.JavascriptInterface;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class DJWebViewJsBridge {
    private static final String TAG = "DJWebViewJsBridge";

    private DJOnMessageReceived _onMessageReceived;
    DJWebViewJsBridge(DJOnMessageReceived messageReceived) {
        this._onMessageReceived = messageReceived;
    }

    @JavascriptInterface
    public void onMessageReceived(String jsonStr) {
        if (this._onMessageReceived == null) return;
        try {
            JSONObject jsonObject = new JSONObject(jsonStr);

            String action = (String) jsonObject.get("action");
            if (action.equals("loadFrameworkEnd")) {
                this.loadFrameworkEnd();
            } else {
                this._onMessageReceived.onMessageReceived(jsonObject);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }
    private void loadFrameworkEnd() {
        JSONArray jsonArray;
        try {
            jsonArray = new JSONArray(DJWebViewMgr.getActions());
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }
        DJWebViewMgr.callJsBridge("applyActions",jsonArray);
    }
}
