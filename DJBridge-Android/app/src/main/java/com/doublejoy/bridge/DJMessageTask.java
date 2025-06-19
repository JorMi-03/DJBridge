package com.doublejoy.bridge;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

public class DJMessageTask {
        private static int callbackIdCounter = 1;
        private final int callbackId;
        private final String action;
        private Object recvData;
        //用于等待消息返回或超时。
        private final CountDownLatch latch = new CountDownLatch(1);
        //用于执行异步任务。
        private final ExecutorService executor = Executors.newSingleThreadExecutor();

        public DJMessageTask(String action) {
            this.callbackId = callbackIdCounter++;
            this.action = action;
        }

        public int getCallbackId() {
            return callbackId;
        }

        public void sendAsync(DJMessageCallback callback) {
            executor.submit(() -> {
                try {
                    // 等待消息返回或超时
                    boolean isCompleted = latch.await(10, TimeUnit.SECONDS);
                    if (isCompleted) {
                        callback.onSuccess(recvData);
                    } else {
                        TimeoutException timeoutEx = new TimeoutException("Message timeout");
                        error(timeoutEx);
                        callback.onError(timeoutEx);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    callback.onError(e);
                }
            });
        }

        public void recv(Object data) {
            this.recvData = data;
            latch.countDown();
        }

        public void error(Object error) {
            this.recvData = error;
            latch.countDown();
        }
        //关闭线程池。
        public void shutdown() {
            executor.shutdown();
        }

}
