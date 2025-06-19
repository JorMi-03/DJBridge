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
        try {
            JSONObject jsonObject = new JSONObject(jsonStr);

            String action = (String) jsonObject.get("action");
            if (action.equals("loadFrameworkEnd")) {
                this.loadFrameworkEnd();
            } else if (action.equals("callBackAction")) {
                JSONObject recvData = jsonObject.getJSONObject("data");
                int callbackId = (int) recvData.get("callbackId");
                boolean success = (boolean) recvData.get("success");
                Object retData = null;
                if (!recvData.isNull("data")) {
                    retData =  recvData.get("data");
                }
                DJMessageTask task =  DJMessageTaskMgr.getInstance().get(callbackId);
                DJMessageTaskMgr.getInstance().remove(callbackId);
                if (success) {
                    task.recv(retData);
                } else {
                    task.error(null);
                }
            } else {
                if (this._onMessageReceived == null) return;
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
        DJWebViewMgr.callJsBridge("applyActions",jsonArray,null);
    }
}
