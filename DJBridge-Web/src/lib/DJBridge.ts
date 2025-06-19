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
    let callbackId: number = 1;
    const callBackAction = "callBackAction";
    // 接口等待时间过长
    const MessageTaskTimeOut = 10 * 1000;
    const MessageTaskMgr = new (class {
        private tasks: Map<number, MessageTask> = new Map();
        public add(task: MessageTask) {
            this.tasks.set(task.callbackId, task);
        }
        public remove(callbackId: number) {
            this.tasks.delete(callbackId);
        }
        public get(callbackId: number) {
            return this.tasks.get(callbackId);
        }
        public clear() {
            this.tasks.clear();
        }
    })();
    class MessageTask {
        public readonly callbackId: number;
        public readonly action: string;
        public readonly sendData: any;
        private recvData: any;
        private resolve: (value: any) => void = null!;
        private reject: (reason?: any) => void = null!;
        private timeoutId: number = 0;
        constructor(action: string, data: any) {
            this.callbackId = callbackId++;
            this.action = action;
            this.sendData = data;
        }
        public async send() {
            if (!djIframe || !djIframe.contentWindow) {
                console.warn("DJBridge: djIframe is null");
                return;
            }
            djIframe.contentWindow.postMessage(
                {
                    action: this.action,
                    data: this.sendData,
                    callbackId: this.callbackId,
                },
                djIframe.src
            );
            // 等待消息返回
            await new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
                // 超时处理
                this.timeoutId = setTimeout(() => {
                    this.error(new Error("DJBridge: message timeout"));
                }, MessageTaskTimeOut);
            });
            return this.recvData;
        }
        public recv(data: any) {
            this.recvData = data;
            if (this.resolve) {
                this.resolve(this.recvData);
            }
            // 清除超时
            clearTimeout(this.timeoutId);
        }
        public error(data: any) {
            if (this.reject) {
                this.reject(data);
            }
            // 清除超时
            clearTimeout(this.timeoutId);
        }
    }
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
                if (data.action == callBackAction) {
                    const taskData = data.data || {};
                    const task = MessageTaskMgr.get(taskData.callbackId);
                    if (task) {
                        if (taskData.success) {
                            task.recv(taskData.data);
                        } else {
                            task.error(taskData.data);
                        }
                        MessageTaskMgr.remove(taskData.callbackId);
                    }
                } else {
                    DJBridge.event.emit(data.action, data.data);
                }
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
        MessageTaskMgr.clear();
        window.removeEventListener("message", messageHandler);
    }
    export async function sendMessageToIframe(action: string, data: any) {
        const task = new MessageTask(action, data);
        MessageTaskMgr.add(task);
        const ret = await task.send();
        return ret;
    }
}
