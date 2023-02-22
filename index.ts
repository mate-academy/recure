'use strict'
import FingerprintJS from '@fingerprintjs/fingerprintjs-pro'
import { apiKeyUrl, eventHandlerUrl } from './config/config'
import { EventType } from './event/eventType';

export type Payload = {
  userId: string,
  provider: string,
  type: EventType,
  visitorId: string,
  visitorFound: boolean,
  confidence: object,
  timestamp: string
}

export type KeyResponse = {
  apiKey: string,
}

export async function getApiKey (url: string, projectApiKey: string): Promise<string> {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-api-key': projectApiKey
    },
  });

  const data: KeyResponse = await response.json();

  return data.apiKey;
}

export async function recure(userId: number | string, projectApiKey: string, eventType: EventType): Promise<any> {
  const recureApiKey: string = await getApiKey(apiKeyUrl, projectApiKey);
  const fp: any = await FingerprintJS.load({ apiKey: recureApiKey })

  try {

    const result: any = await fp.get();

    const timestamp: string = new Date().toISOString();
    const xApiKey: string = projectApiKey;

    const payload: Payload = {
      userId: userId.toString(),
      provider: 'fingerprint',
      type: eventType,
      visitorId: result.visitorId,
      visitorFound: result.visitorFound,
      confidence: result.confidence,
      timestamp: timestamp

    };

    await fetch(eventHandlerUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-key': xApiKey
      },
      body: JSON.stringify(payload),
    })

  } catch (error) {

    console.error(error);
  }

}

module.exports = recure;
module.exports = EventType;
