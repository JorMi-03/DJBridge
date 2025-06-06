import React from "react";
import "./App.css";
import { DJBridgeEvent } from "./lib/DJBridgeEvent";
import { DJToPlatform } from "./lib/DJToPlatform";

class App extends React.Component {
    state = {
        messageText: "",
    };
    private handleCloseApp() {
        DJToPlatform.closeApp();
    }
    private handleHideApp() {
        DJToPlatform.hideApp();
        console.log("hide app, 3s later show app");
        setTimeout(() => {
            DJToPlatform.showApp();
        }, 3000);
    }
    public componentDidMount(): void {
        setTimeout(() => {
            DJToPlatform.loadEnd();
        }, 300);
        DJBridgeEvent.on(DJBridgeEvent.EventType.setMessageText, this.setMessageText, this);
    }
    public componentWillUnmount(): void {
        DJBridgeEvent.targetOff(this);
    }
    private setMessageText(msg: string) {
        this.setState({ messageText: msg });
    }
    public render() {
        return (
            <div className="app-container">
                <div>
                    <button onClick={() => this.handleCloseApp()}>close app</button>
                    <button onClick={() => this.handleHideApp()}>hide app</button>
                    <p>{this.state.messageText}</p>
                </div>
            </div>
        );
    }
}

export default App;
