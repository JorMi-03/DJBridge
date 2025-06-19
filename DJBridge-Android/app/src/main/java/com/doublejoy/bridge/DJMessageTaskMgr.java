package com.doublejoy.bridge;
import java.util.HashMap;
import java.util.Map;

public class DJMessageTaskMgr {
    private static final DJMessageTaskMgr instance = new DJMessageTaskMgr();
    private final Map<Integer, DJMessageTask> tasks = new HashMap<>();

    private DJMessageTaskMgr() {}

    public static DJMessageTaskMgr getInstance() {
        return instance;
    }

    public void add(DJMessageTask task) {
        tasks.put(task.getCallbackId(), task);
    }

    public void remove(int callbackId) {
        tasks.remove(callbackId);
    }

    public DJMessageTask get(int callbackId) {
        return tasks.get(callbackId);
    }


    public void clear() {
        for (DJMessageTask task : tasks.values()) {
            task.shutdown();
        }
        tasks.clear();
    }
}