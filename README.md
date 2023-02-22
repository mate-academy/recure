# recure.ai

## Quick start

First, run `npm install recure` for your app.

Then, in your app put the code:

```typescript
import { recure } from 'recure/web'

// Put this code after successful submitted form sign_up/login
await recure("userId", "your-project-api-key", "eventType");
```