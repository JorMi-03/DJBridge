class ElementEvent {
    /**回调方法 */
    public callback: Function;
    /**事件绑定的对象 */
    public target: Object;
    /**是否只执行一次 */
    public isOnce: boolean;
    constructor(callback: Function, target: Object, isOnce?: boolean) {
        this.callback = callback;
        this.target = target;
        this.isOnce = isOnce || false;
    }
}

/**基础事件模块 */
export class EventTarget {
    private _allEvents: { [key: string | number]: Array<ElementEvent> | undefined } = {};
    /**检测是否已经存在的事件的绑定 */
    public hasEventListener(
        eventKey: string | number,
        callback: Function,
        target: Object
    ): boolean {
        const array = this._allEvents[eventKey];
        if (!array) {
            return false;
        }
        for (let i = array.length - 1; i >= 0; i--) {
            let element = array[i];
            if (!element) {
                array.splice(i, 1);
                continue;
            }
            if (element.callback === callback && element.target === target) {
                return true;
            }
        }
        return false;
    }
    /**
     * 是否存在事件key
     * @param eventKey
     */
    public hasEventKey(eventKey: string | number): boolean {
        let key = eventKey;
        if (!key) {
            return false;
        }
        return !!this._allEvents[key];
    }
    /**
     * 监听事件
     * @param eventKey 事件名
     * @param callback 方法
     * @param target 绑定对象
     * @param isOnce 是否只执行一次
     */
    public on(eventKey: string | number, callback: Function, target: Object, isOnce?: boolean) {
        //避免相同的事件重复注册
        if (this.hasEventListener(eventKey, callback, target)) {
            return;
        }
        if (!this._allEvents[eventKey]) {
            this._allEvents[eventKey] = [];
        }

        this._allEvents[eventKey].unshift(new ElementEvent(callback, target, isOnce));
    }
    public onOnce(eventKey: string | number, callback: Function, target: Object) {
        this.on(eventKey, callback, target, true);
    }
    /**
     * 推送事件
     * @param eventKey 事件名
     * @param param 参数
     */
    public emit(eventKey: string | number, ...param: any): boolean {
        let array = this._allEvents[eventKey];
        if (!array) return false;
        for (let i = array.length - 1; i >= 0; i--) {
            let element = array[i];
            if (!element) {
                array.splice(i, 1);
                continue;
            }
            element.callback.call(element.target, ...param);
            if (element.isOnce) {
                array.splice(i, 1);
                continue;
            }
        }
        return true;
    }
    /**
     * 取消监听
     * @param eventKey 事件名
     * @param callback 方法
     * @param target 绑定对象
     */
    public off(eventKey: string | number, callback: Function, target: Object) {
        let array = this._allEvents[eventKey];
        if (!array) return;
        for (let i = array.length - 1; i >= 0; i--) {
            let element = array[i];
            if (element && element.callback === callback && element.target === target) {
                array.splice(i, 1);
            }
        }
        if (array.length == 0) {
            delete this._allEvents[eventKey];
        }
    }
    /**
     * 取消绑定在对象上的所有事件
     * @param obj 绑定对象
     */
    public targetOff(target: Object) {
        let eventKeys = Object.keys(this._allEvents);
        eventKeys.forEach((key) => {
            const array = this._allEvents[key];
            if (array) {
                for (let i = array.length - 1; i >= 0; i--) {
                    let element = array[i];
                    if (element && element.target === target) {
                        array.splice(i, 1);
                    }
                }
                if (array.length == 0) {
                    delete this._allEvents[key];
                }
            }
        });
    }
    /**
     * key的方式移除
     * @param eventName 事件名
     */
    public keyOff(eventKey: string | number) {
        this._allEvents[eventKey] = undefined;
        delete this._allEvents[eventKey];
    }
    /**
     * 获取所有事件
     */
    public getEvents() {
        return this._allEvents;
    }
    /**
     *
     * @returns 得到所有事件的key
     */
    public getEventKeys() {
        return Object.keys(this._allEvents);
    }
    /**
     * 获取指定事件的所有事件
     * @param eventKey 事件名
     * @returns
     */
    public getKeyAllEvents(eventKey: string | number) {
        return this._allEvents[eventKey];
    }
    /**
     * 清理事件
     */
    public clearEvent() {
        this._allEvents = {};
    }
}
