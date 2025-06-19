package com.doublejoy.bridge;

// 定义回调接口
public interface DJMessageCallback {
    void onSuccess(Object data);

    void onError(Object error);
}
