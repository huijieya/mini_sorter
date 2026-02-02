
/**
 * 前端向后端发送数据
 * 根据要求使用 window.onCSharpResponse(key, params)
 */
export const callBackend = (key: string, params: any = {}) => {
  if (typeof window.onCSharpResponse === 'function') {
    window.onCSharpResponse(key, params);
    console.debug(`[FE->BE] Key: ${key}`, params);
  } else {
    console.warn(`[FE->BE] onCSharpResponse not defined. Key: ${key}`);
  }
};

/**
 * 监听后端推送
 * 后端使用 postMessage(key, res) 推送
 */
export const listenFromBackend = (callback: (key: string, res: any) => void) => {
  if (window.chrome && window.chrome.webview) {
    // 监听 WebView2 的消息事件
    window.chrome.webview.addEventListener('message', (event: any) => {
      // 假设后端传的是字符串化的 JSON，包含 key 和 res
      // 如果后端直接传两个参数，这取决于 WebView2 的具体封装实现
      // 这里根据您的描述，我们处理这种逻辑：
      try {
        const { key, res } = event.data;
        if (key) {
          callback(key, res);
        }
      } catch (e) {
        console.error('Failed to parse message from backend', event.data);
      }
    });
  }
};
