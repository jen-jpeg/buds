import { Capacitor } from '@capacitor/core';

let bootPromise: Promise<void> | null = null;

export function startNodeServer(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return Promise.resolve();
  if (bootPromise) return bootPromise;

  bootPromise = (async () => {
    const { NodeJS } = await import('capacitor-nodejs');
    await NodeJS.whenReady();

    // Poll until Express is accepting requests.
    for (let i = 0; i < 30; i++) {
      try {
        await fetch('http://localhost:3000/api/health');
        return;
      } catch {
        await new Promise((r) => setTimeout(r, 300));
      }
    }
    throw new Error('Express server did not start within 9 s');
  })();

  return bootPromise;
}
