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

class MessageTask {
    let callbackId: Int
    let action:String
    private var resolve: ((Any?) -> Void)?
    private var reject: ((Error) -> Void)?
    private var timeoutTimer: Timer?
    private static var callbackIdCounter = 1
    // 初始化方法
    init(_ action: String,_ completion: ((Result<Any?, Error>) -> Void)? = nil) {
        self.callbackId = MessageTask.callbackIdCounter
        MessageTask.callbackIdCounter += 1
        self.action = action
        // 超时处理
        timeoutTimer = Timer.scheduledTimer(withTimeInterval: 10.0, repeats: false) { [weak self] _ in
            self?.error(with: NSError(domain: "DJBridge", code: -1, userInfo: [NSLocalizedDescriptionKey: "Message timeout"]))
        }

        self.resolve = { data in
            completion?(.success(data))
        }
        self.reject = { error in
            completion?(.failure(error))
        }
    }

    // 接收消息方法
    func recv(data: Any?) {
        resolve?(data)
        timeoutTimer?.invalidate()
        timeoutTimer = nil
    }

    // 错误处理方法
    func error(with error: Error) {
        reject?(error)
        timeoutTimer?.invalidate()
        timeoutTimer = nil
    }
}


// MessageTaskMgr 单例类
class MessageTaskMgr {
    static let shared = MessageTaskMgr()
    private var tasks: [Int: MessageTask] = [:]

    private init() {}

    /// 向任务管理器中添加一个 MessageTask 实例
    /// - Parameter task: 要添加的 MessageTask 实例
    func add(task: MessageTask) {
        tasks[task.callbackId] = task
    }

    /// 从任务管理器中移除指定回调 ID 对应的 MessageTask 实例
    /// - Parameter callbackId: 要移除的 MessageTask 实例的回调 ID
    func remove(callbackId: Int) {
        tasks.removeValue(forKey: callbackId)
    }

    /// 根据回调 ID 获取对应的 MessageTask 实例
    /// - Parameter callbackId: 要获取的 MessageTask 实例的回调 ID
    /// - Returns: 对应的 MessageTask 实例，如果不存在则返回 nil
    func get(callbackId: Int) -> MessageTask? {
        return tasks[callbackId]
    }

    /// 获取当前任务管理器中所有 MessageTask 实例的数量
    /// - Returns: 任务数量
    func size() -> Int {
        return tasks.count
    }

    /// 清空任务管理器中的所有 MessageTask 实例
    func clear() {
        tasks.removeAll()
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

    func sendMessageToJS(_ action: String,_ completion: ((Result<Any?, Error>) -> Void)? = nil , _ data: Any?) {
        var messageDict: [String: Any] = [
            "action": action,
        ]
        if (data != nil) {
            messageDict["data"] = data
        }
        let task = MessageTask(action,completion)
        messageDict["callbackId"] = task.callbackId
        MessageTaskMgr.shared.add(task: task)
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: messageDict, options: [])
            if let jsonString = String(data: jsonData, encoding: .utf8) {
                let escapedJsonString = jsonString.replacingOccurrences(of: "'", with: "\\'")
                evaluateJavaScript(
                    "window.DJGameToPlatformJs('\(escapedJsonString)')",
                    completionHandler: { (result, error) in
                        if let error = error {
                            print("send message to js error: \(error.localizedDescription)")
                        }
                    })
            }
        } catch {
            print("JSON decode error: \(error.localizedDescription)")
            MessageTaskMgr.shared.remove(callbackId: task.callbackId)
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
                                sendMessageToJS("applyActions",nil, actionList)
                            }
                        } else if action == "callBackAction" {
                            let recvData = data as! [String: Any]
                            let callbackId:Int = recvData["callbackId"] as! Int;
                            let success = recvData["success"] as! Bool
                            let retData = recvData["data"]
                            let task = MessageTaskMgr.shared.get(callbackId: callbackId)
                            if (task == nil) {return}
                            if (success) {
                                task?.recv(data: retData)
                            } else {
                                task?.error(with: NSError())
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
    deinit {
        MessageTaskMgr.shared.clear()
    }
}
