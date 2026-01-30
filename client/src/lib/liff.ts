import liff from '@line/liff';

let isInitialized = false;

export async function initLiff(): Promise<void> {
  if (isInitialized) return;

  const liffId = import.meta.env.VITE_LIFF_ID;

  // LIFF IDが設定されていない場合はスキップ（開発時用）
  if (!liffId) {
    console.log('LIFF ID not set, skipping LIFF init');
    return;
  }

  try {
    await liff.init({ liffId });
    isInitialized = true;
    console.log('LIFF initialized successfully');
  } catch (error) {
    console.error('LIFF init failed:', error);
  }
}

export function isInLiff(): boolean {
  return liff.isInClient();
}

export function getLiffUserId(): string | null {
  if (!isInitialized) return null;

  try {
    const context = liff.getContext();
    return context?.userId ?? null;
  } catch {
    return null;
  }
}

export function closeLiff(): void {
  if (isInLiff()) {
    liff.closeWindow();
  }
}

export { liff };
