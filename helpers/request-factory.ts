import {
  request as apiRequest,
  type APIRequestContext,
} from "@playwright/test";
import { env } from "../config/env";

export type RequestContextOptions = {
  token?: string;
  baseURL?: string;
};

/**
 * Vyrobí APIRequestContext s volitelným tokenem a base URL.
 * Volající musí po dokončení zavolat context.dispose().
 */
export async function createRequestContext(
  options?: RequestContextOptions
): Promise<APIRequestContext> {
  const baseURL = options?.baseURL ?? env.BASE_URL;
  const headers: Record<string, string> = {};
  if (options?.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }
  return await apiRequest.newContext({
    baseURL,
    extraHTTPHeaders: headers,
  });
}
