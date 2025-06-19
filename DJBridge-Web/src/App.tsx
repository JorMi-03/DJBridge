import React from "react";
import "./App.css";
import { DJBridge } from "./lib/DJBridge";

class App extends React.Component {
    private DJIframe: HTMLIFrameElement | null = null;
    state = {
        inputValue: "",
    };
    private createIframe() {
        if (this.DJIframe) return;
        this.DJIframe = document.createElement("iframe");
        const iStyle = this.DJIframe.style;
        // 设置 iframe 的尺寸
        iStyle.width = "50%";
        iStyle.height = "50%";
        // 设置样式让 iframe 居中
        iStyle.position = "fixed";
        iStyle.left = "50%";
        iStyle.top = "50%";
        // 使用 transform 微调位置，实现真正的居中
        iStyle.transform = "translate(-50%, -50%)";
        iStyle.border = "0px";
        iStyle.margin = "0px";

        document.body.appendChild(this.DJIframe);

        this.DJIframe.src = "http://localhost:5173/";
        DJBridge.initDJIframe(this.DJIframe);
    }
    public componentDidMount(): void {
        DJBridge.event.on(DJBridge.EventType.closeApp, this.closeIframe, this);
        DJBridge.event.on(DJBridge.EventType.showApp, this.showIframe, this);
        DJBridge.event.on(DJBridge.EventType.hideApp, this.hideIframe, this);
        DJBridge.event.on(DJBridge.EventType.loadFrameworkEnd, this.loadIframeFrameworkEnd, this);
    }
    private loadIframeFrameworkEnd() {
        DJBridge.sendMessageToIframe("applyActions", [
            //
            "showApp",
            "hideApp",
            "closeApp",
        ]);
        DJBridge.sendMessageToIframe("setMessageText", this.state.inputValue);
    }
    private closeIframe() {
        if (this.DJIframe) {
            this.DJIframe.remove();
            this.DJIframe = null;
        }
    }
    private showIframe() {
        if (this.DJIframe) {
            this.DJIframe.style.opacity = "1";
            this.DJIframe.style.zIndex = "1";
        }
    }
    private hideIframe() {
        if (this.DJIframe) {
            this.DJIframe.style.opacity = "0";
            this.DJIframe.style.zIndex = "-999";
        }
    }

    public componentWillUnmount(): void {
        DJBridge.event.targetOff(this);
        DJBridge.removeDJIframe();
    }
    private handleCreateIframe() {
        this.createIframe();
    }
    private handleShowIframe() {
        this.showIframe();
    }
    private handleHideIframe() {
        this.hideIframe();
    }

    private changeInput(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ inputValue: event.target.value });
    }
    async componentDidUpdate(
        prevProps: Readonly<{}>,
        prevState: Readonly<typeof this.state>,
        snapshot?: any
    ): Promise<void> {
        if (prevState.inputValue !== this.state.inputValue) {
            const ret = await DJBridge.sendMessageToIframe("setMessageText", this.state.inputValue);
            console.log("setMessageText:", ret);
        }
    }

    public render() {
        return (
            <>
                <div>
                    <button onClick={() => this.handleCreateIframe()}>Create Iframe</button>
                    <button onClick={() => this.handleShowIframe()}>Show Iframe</button>
                    <button onClick={() => this.handleHideIframe()}>Hide Iframe</button>
                    <input
                        value={this.state.inputValue}
                        onChange={(event) => this.changeInput(event)}
                    ></input>
                </div>
            </>
        );
    }
}

export default App;
