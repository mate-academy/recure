"use strict";
import FingerprintJS from "@fingerprintjs/fingerprintjs-pro";

const apiKeyUrl: string = 'https://api.recure.ai/api/event_handler/get_api_key/';
const eventHandlerUrl: string = 'https://api.recure.ai/api/event_handler/';
const daysToExpire: number = 60;

export enum EventType {
  LOGIN = 'LOGIN',
  SIGN_UP = 'SIGN_UP',
  PAGE = 'PAGE',
  FREE_TRIAL_STARTED = 'FREE_TRIAL_STARTED',
  FREE_TRIAL_ENDED = 'FREE_TRIAL_ENDED',
  SUBSCRIPTION_STARTED = 'SUBSCRIPTION_STARTED',
  SUBSCRIPTION_ENDED = 'SUBSCRIPTION_ENDED'
}

type Payload = {
  userId: string;
  provider: string;
  type: EventType;
  visitorId: string;
  timestamp: string;
  eventName?: string | undefined;
};

type KeyResponse = {
  apiKey: string;
};

async function getApiKey(
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

function setCookie(cookieName: string, cookieValue: string, exdays: number) {
  const date = new Date();
  date.setTime(date.getTime() + (exdays*24*60*60*1000));
  const expires: string = "expires="+ date.toUTCString();
  document.cookie = `${cookieName}=${cookieValue};${expires};path=/`;
}

function getCookie(cookieName: string): string {
  const name: string = cookieName + "=";
  const decodedCookie: string = decodeURIComponent(document.cookie);

  const cookiesParts: string[] = decodedCookie.split(`; ${name}`);

  if (cookiesParts.length === 1) {
    return "";
  }

  const visitorId: string | undefined = cookiesParts.pop()?.split(";")[0];

  return visitorId || "";
}

async function getOrSetVisitorId(cookieName: string, recureApiKey: string): Promise<string> {
  const visitorId: string = getCookie(cookieName);

  if (visitorId !== "") {
    return visitorId;
  }

  const result: any = await getFingerPrintResult(recureApiKey);

  setCookie(cookieName, result.visitorId, daysToExpire);

  return result.visitorId;
}

async function getFingerPrintResult(recureApiKey: string): Promise<any> {
    const fp: any = await FingerprintJS.load({ apiKey: recureApiKey });

    return await fp.get();
}

async function getPayload(
  recureApiKey: string,
  userId: number | string,
  eventType: EventType,
  eventName?: string | undefined
): Promise<Payload> {

  const visitorId = await getOrSetVisitorId("visitorId", recureApiKey)

  return {
    userId: userId.toString(),
    provider: "fingerprint",
    type: eventType,
    visitorId,
    timestamp: new Date().toISOString(),
    eventName: eventName || "",
  };
}

export async function recure(
  userId: number | string,
  projectApiKey: string,
  eventType: EventType,
  eventName?: string | undefined
): Promise<any> {
  const recureApiKey: string = await getApiKey(apiKeyUrl, projectApiKey);

  try {
    const payload: Payload = await getPayload(recureApiKey, userId, eventType, eventName);

    await fetch(eventHandlerUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-api-key": projectApiKey,
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw error;
  }
}
