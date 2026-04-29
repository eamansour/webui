/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { API_TIMEOUT } from './constants/common';

/**
 * Performs a fetch request with a configurable timeout using AbortSignal.timeout().
 *
 * @param url - The URL to fetch
 * @param options - Standard fetch options
 * @param timeout - Timeout in milliseconds (default: uses API_TIMEOUT constant)
 * @returns Promise that resolves to the Response
 * @throws Error if the request times out or fails
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = API_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (fetchError) {
    clearTimeout(timeoutId);
    if (fetchError instanceof Error && fetchError.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw fetchError;
  }
}
