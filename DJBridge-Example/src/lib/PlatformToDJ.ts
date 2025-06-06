/**
 * 平台到DJ的消息
 */

import { DJBridge } from "./DJBridge";
import { DJBridgeEvent } from "./DJBridgeEvent";

export namespace PlatformToDJ {
    /**
     * 申请可以调用的动作列表
     * 注意：这个动作列表是平台提供的，DJBridge会自动过滤掉没有申请的动作，避免安全问题
     * @param actions 动作列表
     */
    export function applyActions(actions: Array<string>) {
        DJBridge.applyActions(actions);
    }
    export function setMessageText(text: string) {
        DJBridgeEvent.emit(DJBridgeEvent.EventType.setMessageText, text);
    }
}
