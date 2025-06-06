import { EventTarget } from "../core/EventTarget";

export namespace DJBridge {
    export const event = new EventTarget();
    export const EventType = {
        /**
         * 关闭应用
         */
        closeApp: "closeApp",
        /**
         * 隐藏应用
         */
        hideApp: "hideApp",
        /**
         * 显示应用
         */
        showApp: "showApp",
        /**
         * 开始加载，这里的加载指的是example的脚本加载完成后的加载，html加载完成后才会执行
         */
        startLoad: "startLoad",
        /**
         * 加载结束，这里的加载指的是example中的加载逻辑完成
         */
        loadEnd: "loadEnd",
        /**
         * 加载框架结束，这里完成后即可处理业务逻辑
         */
        loadFrameworkEnd: "loadFrameworkEnd",
    };

    let djIframe: HTMLIFrameElement | null = null;
    /**
     * 初始化DJBridge
     * @param iframe iframe元素
     */
    function messageHandler(event: MessageEvent) {
        if (!djIframe) {
            console.warn("DJBridge: djIframe is null");
            removeDJIframe();
            return;
        }

        if (
            event.origin === new URL(djIframe.src).origin &&
            event.source === djIframe.contentWindow
        ) {
            const data = event.data;
            if (typeof data == "object" && data != null && typeof data.action == "string") {
                DJBridge.event.emit(data.action, data.data);
            }
        }
    }
    export function initDJIframe(iframe: HTMLIFrameElement) {
        if (djIframe) {
            removeDJIframe();
        }
        djIframe = iframe;
        window.addEventListener("message", messageHandler);
    }
    export function removeDJIframe() {
        if (djIframe) {
            djIframe = null;
        }
        window.removeEventListener("message", messageHandler);
    }
    export function sendMessageToIframe(action: string, data: any) {
        if (!djIframe) {
            console.warn("DJBridge: djIframe is null");
            return;
        }
        djIframe.contentWindow?.postMessage(
            {
                action: action,
                data: data,
            },
            djIframe.src
        );
    }
}
