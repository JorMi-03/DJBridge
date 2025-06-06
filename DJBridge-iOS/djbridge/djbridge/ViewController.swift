//
//  ViewController.swift
//  djbridge
//
//  Created by admin on 2025/6/4.
//

import UIKit
import WebKit

class ViewController: UIViewController {
    @IBOutlet weak var mainWebView: WKWebView?
    @IBOutlet weak var button: UIButton?
    @IBOutlet weak var textField: UITextField?
    @IBOutlet weak var gameView: UIView?
    private var djWebView: DJWebView?

    override func viewDidLoad() {
        super.viewDidLoad()
        if let url = URL(string: "https://www.google.com/") {
            let request = URLRequest(url: url)
            if mainWebView != nil {
                mainWebView?.load(request)
            }
        }
        gameView?.isHidden = true
        button?.addTarget(self, action: #selector(buttonTapped(_:)), for: .touchUpInside)
        textField?.addTarget(self, action: #selector(editingChanged(_:)), for: .editingChanged)
    }

    @objc func buttonTapped(_ sender: UIButton) {
        guard let gameView = gameView else { return }

        if gameView.isHidden == true && djWebView == nil {
            gameView.isHidden = false
            djWebView = DJWebView(frame: gameView.bounds)
            if let webview = djWebView {
                webview.autoresizingMask = [.flexibleWidth, .flexibleHeight]
                // iOS 16.4之后配置开启是否开启调试
                if #available(iOS 16.4, *) {
                    webview.isInspectable = true
                }
                gameView.addSubview(webview)
                webview.onMessageReceived = onDJMessageReceived
                webview.registerActions([
                    "showApp",
                    "hideApp",
                    "closeApp",
                ])
                // 重点修改: 将webview先放到屏幕下方（用户不可见位置）
                let offScreenFrame = CGRect(
                    x: 0,
                    y: UIScreen.main.bounds.height,  // 放置到gameView底部之外
                    width: gameView.bounds.width,
                    height: gameView.bounds.height)

                webview.frame = offScreenFrame
                // 加载网页
                if let webUrl = URL(string: "http://localhost/bridge-example/") {
                    webview.loadUrl(webUrl)
                }
            }
        } else {
            showAlert("DJWebView 已经创建")
        }

    }

    func onDJMessageReceived(action: String, data: Any?) {
        guard let gameview = gameView, let webview = djWebView else { return }
        switch action {
        // 可以结合startLoad 做更适合当前产品的过场过程
        case "startLoad":
            //            webview.frame = gameview.bounds
            break
        case "loadEnd":
            webview.frame = gameview.bounds
            break
        case "closeApp":
            removeDJWebView()
            break
        case "hideApp":
            hideDJWebView()
            break
        case "showApp":
            showDJWebView()
            break
        default: break
        }
    }
    func removeDJWebView() {
        djWebView!.stopLoading()
        djWebView!.removeFromSuperview()
        djWebView = nil
        gameView!.isHidden = true
    }

    func hideDJWebView() {
        gameView!.isHidden = true
    }

    func showDJWebView() {
        gameView!.isHidden = false
    }
    // 显示提示框的方法
    func showAlert(_ message: String) {
        let alertController = UIAlertController(
            title: "提示", message: message, preferredStyle: .alert)
        let okAction = UIAlertAction(title: "确定", style: .default, handler: nil)
        alertController.addAction(okAction)
        present(alertController, animated: true, completion: nil)
    }

    @objc func editingChanged(_ textField: UITextField) {
        guard let webview = djWebView else { return }
        webview.sendMessageToJS("setMessageText", textField.text as Any)
    }

}
