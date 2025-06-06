import { EventTarget } from "../core/EventTarget";

class BridgeEvent extends EventTarget {
    public EventType = {
        setMessageText: "setMessageText",
    };
}

export const DJBridgeEvent = new BridgeEvent();
