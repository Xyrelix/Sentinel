export interface Eip1193Provider {
  request<T = unknown>(args: { method: string; params?: unknown[] | object }): Promise<T>;
  on?(event: string, handler: (...args: unknown[]) => void): void;
  removeListener?(event: string, handler: (...args: unknown[]) => void): void;
  isOKXWallet?: boolean;
  isMetaMask?: boolean;
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
    okxwallet?: Eip1193Provider;
  }
}

export {};
