# recure.ai

Recure AI helps companies increase their revenue by detecting account sharers and free trial abusers and converting them into paying customers

## Quick start

First, run `npm install recure` for your app.

Then, in your app put the code:

```typescript
import { recure, EventType } from 'recure/web'

// Put this code after successful submitted form sign_up/login
await recure("userId", "your-project-api-key", EventType.LOGIN);
```

Possible events in `EventType`:
* LOGIN
* SIGN_UP
* PAGE
* FREE_TRIAL_STARTED
* FREE_TRIAL_ENDED
* SUBSCRIPTION_STARTED
* SUBSCRIPTION_ENDED

**Note:** If you use the `PAGE` event, you also should put `eventOption` as a 4-th parameter of the function.

```typescript
import { recure, EventType } from 'recure/web'

await recure("userId", "your-project-api-key", EventType.PAGE, {pageName: "pageName"});
```

**Also, if you use the `PAGE` event, recure will receive it no more than once in 5 minutes.**