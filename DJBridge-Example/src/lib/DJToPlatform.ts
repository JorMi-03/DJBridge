/**
 * DJ 到平台的消息
 */

import { DJBridge } from "./DJBridge";
export namespace DJToPlatform {
    export function closeApp() {
        DJBridge.sendMessage("closeApp");
    }
    export function hideApp() {
        DJBridge.sendMessage("hideApp");
    }
    export function showApp() {
        DJBridge.sendMessage("showApp");
    }
    /**
     * 开始加载，这里的加载指的是example的脚本加载完成后的加载，html加载完成后才会执行
     */
    export function startLoad() {
        DJBridge.sendMessage("startLoad");
    }
    /**
     * 加载结束，这里的加载指的是example中的加载逻辑完成
     */
    export function loadEnd() {
        DJBridge.sendMessage("loadEnd");
    }
    /**
     * 加载框架结束，这里完成后即可处理业务逻辑
     */
    export function loadFrameworkEnd() {
        DJBridge.sendMessage("loadFrameworkEnd");
    }
}
// 不需要申请的请求
DJBridge.applyActions([
    //
    "startLoad",
    "loadEnd",
    "loadFrameworkEnd",
]);
