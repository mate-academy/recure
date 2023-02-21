import FingerprintJS from '@fingerprintjs/fingerprintjs-pro'

async function getApiKey (url, projectApiKey) {
  let response = await fetch(url, {
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

function recure(userId, projectApiKey, eventType) {
  const recureApiKey = getApiKey("https://api.dev.recure.ai/api/event_handler/get_api_key/", projectApiKey)
  const fpPromise = FingerprintJS.load({ apiKey: recureApiKey })
  fpPromise
  .then(fp => fp.get())
  .then(result => {
      const xApiKey = projectApiKey;
      result.provider = 'fingerprint';
      result.userId = userId.toString();
      result.type = eventType 
      fetch('https://api.dev.recure.ai/api/event_handler/', {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-api-key': xApiKey
      },
      body: JSON.stringify(result)
      })
  })
  .catch(error => console.error(error))
}

module.exports = recure
