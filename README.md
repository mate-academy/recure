# recure.ai

## Quick start

First, run `npm install recure` for your app.

Then, in an Express app:

```typescript
import { recure } from 'recure/lib'

// Put this code after successful submitted form sign_up/login
await recure("userId", "your-project-api-key", "eventType");
```