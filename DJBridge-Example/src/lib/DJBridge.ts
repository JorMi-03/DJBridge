import type { PlatformToDJ } from "./PlatformToDJ";

function isInIframe(): boolean {
    return window.parent !== window;
}
const u = navigator.userAgent;
const isAndroid = u.indexOf("Android") > -1 || u.indexOf("Adr") > -1;
const isiOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);

class djbridge {
    /**
     * 发送消息
     * @param action 动作
     * @param data 数据
     */
    public sendMessage: (action: string, data?: any) => void = () => {};
    private _actions: Array<string> = [];
    constructor() {
        this.initSendMessage();
    }
    private initSendMessage() {
        if (isInIframe()) {
            this.sendMessage = (action: string, data: any) => {
                if (!this.isAction(action)) return;
                window.parent?.postMessage(
                    {
                        action: action,
                        data: data,
                    },
                    "*"
                );
            };
        } else {
            if (isAndroid) {
                // @ts-ignore
                const DJAndroidBridge = window["DJAndroidBridge"];
                if (DJAndroidBridge) {
                    this.sendMessage = (action: string, data: any) => {
                        if (!this.isAction(action)) return;
                        const message = {
                            action: action,
                            data: data,
                        };
                        DJAndroidBridge.onMessageReceived?.(JSON.stringify(message));
                    };
                } else {
                    console.warn("DJAndroidBridge is not defined");
                }
            } else if (isiOS) {
                // @ts-ignore
                const DJiOSBridge = window?.webkit?.messageHandlers?.DJiOSBridge;
                // 检查是否在 iOS WebView 环境中
                if (DJiOSBridge) {
                    this.sendMessage = (action: string, data: any) => {
                        // @ts-ignore
                        const DJiOSBridge = window?.webkit?.messageHandlers?.DJiOSBridge;
                        if (!DJiOSBridge) {
                            console.log("DJiOSBridge is not defined");
                            return;
                        }
                        if (!this.isAction(action)) return;
                        const message = {
                            action: action,
                            data: data,
                        };
                        // 发送消息到 iOS 端
                        DJiOSBridge.postMessage(JSON.stringify(message));
                    };
                } else {
                    console.log("Not in iOS WebView environment");
                }
            }
        }
    }
    /**
     * 初始化接收消息
     */
    public initReceptor(receptorMgr: typeof PlatformToDJ) {
        if (isInIframe()) {
            window.addEventListener("message", (event) => {
                const data = event.data;
                if (typeof data != "object" || data == null || !data.action) return;
                const action: keyof typeof PlatformToDJ = data.action;
                receptorMgr[action]?.(data.data);
            });
        } else {
            if (isAndroid) {
                // @ts-ignore
                window["DJAndroidBridgeToJs"] = (jsonStr: string) => {
                    let action: keyof typeof PlatformToDJ, data: any;
                    try {
                        const json = JSON.parse(jsonStr);
                        action = json.action;
                        data = json.data;
                    } catch (error) {
                        console.log("DJAndroidBridgeToJs error:", jsonStr, error);
                        return;
                    }
                    receptorMgr[action]?.(data);
                };
            } else if (isiOS) {
                // @ts-ignore
                window["DJiOSBridgeToJs"] = (jsonStr: string) => {
                    let action: keyof typeof PlatformToDJ, data: any;
                    try {
                        const json = JSON.parse(jsonStr);
                        action = json.action;
                        data = json.data;
                    } catch (error) {
                        console.log("DJiOSBridgeToJs error:", jsonStr, error);
                        return;
                    }
                    receptorMgr[action]?.(data);
                };
            }
        }
    }
    /**
     *  申请动作列表
     * @param actions 动作列表
     */
    public applyActions(actions: Array<string>) {
        if (!actions || actions.length === 0) {
            return;
        }
        for (let i = 0; i < actions.length; i++) {
            const action = actions[i];
            if (this._actions.includes(action)) {
                continue;
            }
            this._actions.push(action);
        }
    }
    public isAction(action: string): boolean {
        return this._actions.includes(action);
    }
}

export const DJBridge = new djbridge();
