# recure.ai

## Quick start

First, run `npm install recure` for your app.

Then, in your app put the code:

```typescript
import { recure, EventType } from 'recure/web'

// Put this code after successful submitted form sign_up/login, 4-th parameter is optional and uses only with EventType.PAGE
await recure("userId", "your-project-api-key", EventType.NameOfEvent, "subcription-page");
```

Possible events in `EventType`:
* LOGIN
* SIGN_UP
* PAGE
* FREE_TRIAL_STARTED
* FREE_TRIAL_ENDED
* SUBSCRIPTION_STARTED
* SUBSCRIPTION_ENDED

**Note:** If you use the `PAGE` event, you also should put `eventName` as a 4-th parameter of the function.
