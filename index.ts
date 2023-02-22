import FingerprintJS from '@fingerprintjs/fingerprintjs-pro'
import { apiKeyUrl, eventHandlerUrl } from './config/config'

type Data = {
  userId: string,
  provider: string,
  type: string,
  visitorId: string,
  visitorFound: boolean,
  confidence: object,
  timestamp: string
}

async function getApiKey (url: string, projectApiKey: string): Promise<string> {
  const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-api-key': projectApiKey
      },
  });

  const data: any = await response.json();

  return data.apiKey;
}

async function recure(userId: number | string, projectApiKey: string, eventType: string): Promise<any> {
  const recureApiKey: string = await getApiKey(apiKeyUrl, projectApiKey)
  const fpPromise: Promise<any> = FingerprintJS.load({ apiKey: recureApiKey })

  try {
    await fpPromise
      .then((fp: any) => fp.get())
      .then(async (result: any) => {
        const timestamp: string = new Date().toISOString();
        const xApiKey: string = projectApiKey;
        
        const data: Data = {
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
        body: JSON.stringify(data)
        })
      })

  } catch (error) {

    console.error(error);
  }

}

module.exports = recure;
