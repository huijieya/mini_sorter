
export enum SlotStatus {
  CLOSED = 'closed',
  OPEN = 'open',
  IN_PROGRESS = 'in-progress',
  FULL = 'full',
  FINISHED = 'finished'
}

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
  online: boolean;
  slots: Slot[];
}

export interface HardwareStatus {
  cameraConnected: boolean;
  deviceConnected: boolean;
  wesConnected: boolean;
}

export interface OrderInfo {
  orderId: string;
  barcode: string;
  name: string;
  required: number;
  actual: number;
}

export interface FeedbackMessage {
  text: string;
  type: 'info' | 'success' | 'error';
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
    onCSharpResponse?: (key: string, params: any) => void;
  }
}
