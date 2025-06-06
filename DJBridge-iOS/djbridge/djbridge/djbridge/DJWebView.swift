import UIKit
import WebKit

class WebViewMessageHandler: NSObject, WKScriptMessageHandler {
    weak var delegate: WKScriptMessageHandler?

    init(delegate: WKScriptMessageHandler? = nil) {
        self.delegate = delegate
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        delegate?.userContentController(userContentController, didReceive: message)
    }
}
class DJWebView: WKWebView, WKUIDelegate, WKScriptMessageHandler {

    // 注意：这里我们需要把handler设置为属性，防止被提前释放
    private var messageHandler: WebViewMessageHandler!
    private var actionList: [String]!
    // web端发送事件的监听器
    var onMessageReceived: ((_ action: String,_ data: Any?) -> Void)?

    init(frame: CGRect) {
        let config = WKWebViewConfiguration()

        // 先配置所有项
        if #available(iOS 14.0, *) {
            config.defaultWebpagePreferences.allowsContentJavaScript = true
        } else {
            config.preferences.javaScriptEnabled = true
        }
        config.preferences.javaScriptCanOpenWindowsAutomatically = true
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        let userContentController = WKUserContentController()

        // 重点：创建中介对象handler，不依赖于self，避免初始化顺序问题
        self.messageHandler = WebViewMessageHandler(delegate: nil)
        userContentController.add(self.messageHandler, name: "DJiOSBridge")
        config.userContentController = userContentController
        
        super.init(frame: frame, configuration: config)
        self.uiDelegate = self

        self.messageHandler.delegate = self
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    func loadUrl(_ url: URL) {
        let request = URLRequest(url: url)
        load(request)
    }
    /**
     * 注册web端能够使用的接口
     */
    func registerActions(_ actions: [String]) {
        actionList = actions
    }

    func sendMessageToJS(_ action: String, _ data: Any?) {
        var messageDict: [String: Any] = [
            "action": action,
        ]
        if data != nil {
            messageDict["data"] = data
        }

        do {
            let jsonData = try JSONSerialization.data(withJSONObject: messageDict, options: [])
            if let jsonString = String(data: jsonData, encoding: .utf8) {
                let escapedJsonString = jsonString.replacingOccurrences(of: "'", with: "\\'")
                evaluateJavaScript(
                    "window.DJiOSBridgeToJs('\(escapedJsonString)')",
                    completionHandler: { (result, error) in
                        if let error = error {
                            print("send message to js error: \(error.localizedDescription)")
                        }
                    })
            }
        } catch {
            print("JSON decode error: \(error.localizedDescription)")
        }
    }

    // MARK: - WKScriptMessageHandler
    func userContentController(
        _ userContentController: WKUserContentController, didReceive message: WKScriptMessage
    ) {
        if message.name == "DJiOSBridge" {
            if let body = message.body as? String {
                guard let bodyData = body.data(using: .utf8) else { return }
                do {
                    if let jsonDict = try JSONSerialization.jsonObject(with: bodyData, options: []) as? [String: Any] {
                        let action = jsonDict["action"] as! String
                        let data = jsonDict["data"]
                        if action == "loadFrameworkEnd" {
                            if actionList != nil {
                                sendMessageToJS("applyActions", actionList)
                            }
                        } else {
                            onMessageReceived?(action, data)
                        }
                    }
                } catch {
                    print("JSON 解析错误: \(error.localizedDescription)")
                }
            }
        }
    }
}
