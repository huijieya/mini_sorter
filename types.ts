
export enum SlotStatus {
  CLOSED = 'closed',
  OPEN = 'open',
  IN_PROGRESS = 'in-progress',
  FULL = 'full',
  FINISHED = 'finished'
}

// Fix: Added missing SortingMode type export to resolve 'has no exported member' errors
export type SortingMode = 'single' | 'multi';

export interface Slot {
  id: string;
  label: string;
  count: number;
  status: SlotStatus;
}

export interface Wall {
  id: string;
  name: string;
  online: boolean; // 新增：是否在线
  slots: Slot[];
}

export interface HardwareStatus {
  cameraConnected: boolean;
  networkConnected: boolean;
}

export interface OrderInfo {
  orderId: string;
  barcode: string;
  name: string;
  required: number;
  actual: number;
  imageUrl?: string;
}

export interface BackendResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

declare global {
  interface Window {
    chrome: {
      webview: {
        postMessage: (message: any) => void;
        addEventListener: (type: string, listener: (event: any) => void) => void;
      };
    };
    // 前端调用的后端方法
    onCSharpResponse?: (key: string, params: any) => void;
  }
}
