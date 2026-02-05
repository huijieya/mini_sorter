/**
 * 前端向后端发送数据
 */
export const callBackend = (key, params = {}) => {
  if (typeof window.onCSharpResponse === 'function') {
    window.onCSharpResponse(key, params);
    console.debug(`[FE->BE] Key: ${key}`, params);
  } else {
    console.warn(`[FE->BE] onCSharpResponse not defined. Key: ${key}`);
  }
};

/**
 * 监听后端推送
 */
export const listenFromBackend = (callback) => {
  if (window.chrome && window.chrome.webview) {
    window.chrome.webview.addEventListener('message', (event) => {
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