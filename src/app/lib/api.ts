import { Capacitor } from '@capacitor/core';

const BASE = Capacitor.isNativePlatform() ? 'http://localhost:3000' : '';

export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${BASE}${path}`, init);
}
