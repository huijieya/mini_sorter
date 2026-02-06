
/**
 * 前端向后端发送指令 (Frontend -> Backend)
 * 对应协议 1.2 & 2.0
 * @param {string} key 指令标识
 * @param {object} params 业务参数 (协议中的 res 字段内容)
 */
export const callBackend = (key, params = {}) => {
  if (window.chrome && window.chrome.webview) {
    // 严格遵循协议 1.2: { key, res }
    window.chrome.webview.postMessage({ key, res: params });
    console.log(`[FE -> BE] Sending:`, key, params);
  } else {
    console.log(`[FE -> BE] WebView2 not found. Simulated Key: ${key}`, params);
  }
};

/**
 * 监听后端推送指令 (Backend -> Frontend)
 * 对应协议 1.1 & 3.0
 * @param {Function} callback 接收 (key, params) 的回调
 */
export const listenFromBackend = (callback) => {
  // 严格遵循协议 1.1: window.onCSharpResponse(key, params)
  window.onCSharpResponse = (key, params) => {
    console.log(`[BE -> FE] Received:`, key, params );
    callback(key, params);
  };
};
