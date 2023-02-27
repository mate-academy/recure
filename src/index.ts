"use strict";
import FingerprintJS from "@fingerprintjs/fingerprintjs-pro";

export const apiKeyUrl: string = 'https://api.recure.ai/api/event_handler/get_api_key/';
export const eventHandlerUrl: string = 'https://api.recure.ai/api/event_handler/';

export enum EventType {
  LOGIN = 'LOGIN',
  SIGN_UP = 'SIGN_UP',
  PAGE = 'PAGE',
  FREE_TRIAL_STARTED = 'FREE_TRIAL_STARTED',
  FREE_TRIAL_ENDED = 'FREE_TRIAL_ENDED',
  SUBSCRIPTION_STARTED = 'SUBSCRIPTION_STARTED',
  SUBSCRIPTION_ENDED = 'SUBSCRIPTION_ENDED'
}

export type Payload = {
  userId: string;
  provider: string;
  type: EventType;
  visitorId: string;
  visitorFound: boolean;
  confidence: object;
  timestamp: string;
  eventName?: string | undefined;
};

export type KeyResponse = {
  apiKey: string;
};

export async function getApiKey(
  url: string,
  projectApiKey: string
): Promise<string> {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": projectApiKey,
    },
  });

  const data: KeyResponse = await response.json();

  return data.apiKey;
}

export async function recure(
  userId: number | string,
  projectApiKey: string,
  eventType: EventType,
  eventName?: string | undefined
): Promise<any> {
  const recureApiKey: string = await getApiKey(apiKeyUrl, projectApiKey);
  const fp: any = await FingerprintJS.load({ apiKey: recureApiKey });

  try {
    const result: any = await fp.get();
    const xApiKey: string = projectApiKey;

    const payload: Payload = {
      userId: userId.toString(),
      provider: "fingerprint",
      type: eventType,
      visitorId: result.visitorId,
      visitorFound: result.visitorFound,
      confidence: result.confidence,
      timestamp: new Date().toISOString(),
      eventName: eventName || "",
    };

    await fetch(eventHandlerUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-api-key": xApiKey,
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw error;
  }
}
