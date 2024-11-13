# @ai16z/client-twitter

A Twitter client for the Eliza project with support for tweet approval workflows.

## Features

- Automated tweet generation and posting
- Optional tweet approval system with multiple interfaces:
  - CLI-based approval interface
  - Web-based approval interface
- Configurable approval timeout
- Webhook notifications for approval events
- SQLite-based persistent queue management

## Installation

```bash
pnpm add @ai16z/client-twitter
```

## Basic Usage

```typescript
import { TwitterClient } from '@ai16z/client-twitter';

const client = new TwitterClient({
    // Twitter API credentials
    bearerToken: process.env.TWITTER_BEARER_TOKEN,
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,

    // Optional approval configuration
    approvalRequired: true,
    approvalMethod: 'web', // or 'cli'
    approvalTimeout: 24 * 60 * 60 * 1000, // 24 hours
    webhookUrl: 'https://your-webhook.com/twitter-approval'
});

// Start the client
await client.start();
```

## Configuration Options

### Twitter API Configuration
- `bearerToken`: Twitter API bearer token
- `clientId`: Twitter API client ID
- `clientSecret`: Twitter API client secret

### Approval System Configuration
- `approvalRequired`: Enable/disable tweet approval workflow (default: false)
- `approvalMethod`: Choose approval interface ('web' or 'cli', default: 'web')
- `approvalTimeout`: Time in milliseconds before pending tweets expire (default: 24 hours)
- `webhookUrl`: Optional URL for approval event notifications

### Web Interface Configuration
- `port`: Port for web interface (default: 3000)
- `host`: Host for web interface (default: 'localhost')

## Approval Workflow

When `approvalRequired` is enabled, tweets go through the following workflow:

1. Tweet is generated and added to approval queue
2. Notification sent via configured interface (web/CLI)
3. Tweet awaits approval/rejection
4. If approved: Tweet is posted to Twitter
   If rejected/expired: Tweet is discarded

### Web Interface

The web interface provides a user-friendly dashboard for managing tweet approvals:

- View pending tweets
- Approve/reject tweets
- View approval history
- Configure notification settings

Access the web interface at: `http://localhost:3000/twitter-approval`

### CLI Interface

The CLI interface allows for quick tweet approvals directly from the terminal:

```bash
# List pending tweets
twitter-approve list

# Approve a tweet
twitter-approve approve <tweet-id>

# Reject a tweet
twitter-approve reject <tweet-id>
```

### Webhook Notifications

When a webhook URL is configured, the system sends POST requests for the following events:

- Tweet pending approval
- Tweet approved
- Tweet rejected
- Tweet expired

Webhook payload example:
```json
{
    "action": "approved",
    "tweet": {
        "id": "123",
        "content": "Tweet content",
        "status": "approved",
        "createdAt": "2024-01-01T00:00:00Z",
        "metadata": {
            "source": "eliza",
            "priority": "normal"
        }
    }
}
```

## Error Handling

The client includes robust error handling for various scenarios:

- API rate limiting
- Network failures
- Approval timeout
- Invalid configurations

Errors are logged and can be handled through the event system:

```typescript
client.on('error', (error) => {
    console.error('Twitter client error:', error);
});
```

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test

# Watch mode for development
pnpm dev
```

For detailed usage examples and advanced configuration options, see [Twitter Integration Guide](../docs/twitter.md).
