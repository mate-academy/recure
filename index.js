import FingerprintJS from '@fingerprintjs/fingerprintjs-pro'
import { apiKeyUrl, eventHandlerUrl } from './config/config'

async function getApiKey (url, projectApiKey) {
  const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-api-key': projectApiKey
      },
  });

  const data = await response.json();

  return data.apiKey;
}

async function recure(userId, projectApiKey, eventType) {
  const recureApiKey = await getApiKey(apiKeyUrl, projectApiKey)
  const fpPromise = FingerprintJS.load({ apiKey: recureApiKey })
  fpPromise
  .then(fp => fp.get())
  .then(result => {
      const timestamp = new Date().toISOString();
      const xApiKey = projectApiKey;
      
      const data = {
        'userId': userId.toString(),
        'provider': 'fingerprint',
        'eventType': eventType,
        'visitorId': result.visitorId,
        'visitorFound': result.visitorFound,
        'confidence': result.confidence,
        'timestamp': timestamp

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
  .catch(error => console.error(error))
}

module.exports = recure;
