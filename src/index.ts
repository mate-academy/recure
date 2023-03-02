"use strict";
import FingerprintJS from "@fingerprintjs/fingerprintjs-pro";
import * as Cookies from "js-cookie";

const apiKeyUrl: string = "https://api.recure.ai/api/event_handler/get_api_key/";
const eventHandlerUrl: string = "https://api.recure.ai/api/event_handler/";
const daysToExpire: number = 60;
const minutesToExpire: number = 5;
const inFiveMinutes: Date = new Date(new Date().getTime() + minutesToExpire * 60 * 1000);


export enum EventType {
  LOGIN = "LOGIN",
  SIGN_UP = "SIGN_UP",
  PAGE = "PAGE",
  FREE_TRIAL_STARTED = "FREE_TRIAL_STARTED",
  FREE_TRIAL_ENDED = "FREE_TRIAL_ENDED",
  SUBSCRIPTION_STARTED = "SUBSCRIPTION_STARTED",
  SUBSCRIPTION_ENDED = "SUBSCRIPTION_ENDED"
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

async function getOrSetVisitorId(cookieName: string, recureApiKey: string): Promise<string> {
  const visitorId: string | undefined = Cookies.get(cookieName);

  if (visitorId !== "" && visitorId !== undefined) {
    return visitorId;
  }

  const result: any = await getFingerPrintResult(recureApiKey);

  Cookies.set(cookieName, result.visitorId, { expires: daysToExpire, path: "" });

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

function isReadyToSend(): boolean {
  const readyToSend: string | undefined = Cookies.get("readyToSend");

  if (readyToSend === undefined) {
    Cookies.set("readyToSend", "false", { expires: inFiveMinutes, path: "" });
    return true
  }

  return false
}

export async function recure(
  userId: number | string,
  projectApiKey: string,
  eventType: EventType,
  eventName?: string | undefined
): Promise<any> {

  if (eventName === EventType.PAGE && !isReadyToSend()) {
      return;
  }

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
