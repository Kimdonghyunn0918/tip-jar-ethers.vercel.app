interface Window {
  ethereum?: {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    // MetaMask의 다른 메서드 추가 가능
  };
}
