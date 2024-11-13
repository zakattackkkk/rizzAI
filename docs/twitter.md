# Twitter Integration Guide

This guide provides detailed examples and best practices for integrating the Twitter client with approval workflows in your Eliza project.

## Table of Contents
- [Basic Setup](#basic-setup)
- [Approval Workflow Integration](#approval-workflow-integration)
- [Advanced Configuration](#advanced-configuration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Basic Setup

### Installation

```bash
cd your-project
pnpm add @ai16z/client-twitter
```

### Environment Configuration

Create a `.env` file with your Twitter API credentials:

```env
TWITTER_BEARER_TOKEN=your_bearer_token
TWITTER_CLIENT_ID=your_client_id
TWITTER_CLIENT_SECRET=your_client_secret
```

### Basic Client Setup

```typescript
import { TwitterClient } from '@ai16z/client-twitter';
import dotenv from 'dotenv';

dotenv.config();

const client = new TwitterClient({
    bearerToken: process.env.TWITTER_BEARER_TOKEN,
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET
});

await client.start();
```

## Approval Workflow Integration

### Web Interface Setup

```typescript
const client = new TwitterClient({
    // ... API credentials ...
    approvalRequired: true,
    approvalMethod: 'web',
    port: 3000,
    host: 'localhost'
});

// Start the client and web interface
await client.start();
console.log('Web approval interface available at: http://localhost:3000/twitter-approval');
```

### CLI Interface Setup

```typescript
const client = new TwitterClient({
    // ... API credentials ...
    approvalRequired: true,
    approvalMethod: 'cli'
});

// Start the client with CLI approval interface
await client.start();
```

### Custom Approval Flow with Webhooks

```typescript
const client = new TwitterClient({
    // ... API credentials ...
    approvalRequired: true,
    approvalMethod: 'web',
    webhookUrl: 'https://your-service.com/webhooks/twitter',
    approvalTimeout: 12 * 60 * 60 * 1000 // 12 hours
});

// Listen for approval events
client.on('tweet:pending', (tweet) => {
    console.log('New tweet pending approval:', tweet);
});

client.on('tweet:approved', (tweet) => {
    console.log('Tweet approved:', tweet);
});

client.on('tweet:rejected', (tweet) => {
    console.log('Tweet rejected:', tweet);
});

client.on('tweet:expired', (tweet) => {
    console.log('Tweet expired:', tweet);
});
```

## Advanced Configuration

### Custom Approval Queue Configuration

```typescript
import { ApprovalQueue } from '@ai16z/client-twitter';

// Create a custom approval queue
const approvalQueue = new ApprovalQueue({
    dbPath: './custom-queue.db',
    defaultTimeout: 48 * 60 * 60 * 1000, // 48 hours
    webhookUrl: 'https://your-service.com/webhooks/twitter'
});

// Use custom queue with client
const client = new TwitterClient({
    // ... API credentials ...
    approvalRequired: true,
    approvalQueue
});
```

### Rate Limiting and Retry Configuration

```typescript
const client = new TwitterClient({
    // ... API credentials ...
    rateLimitDelay: 1000, // Delay between tweets in ms
    maxRetries: 3, // Number of retries for failed posts
    retryDelay: 5000 // Delay between retries in ms
});
```

### Custom Tweet Generation

```typescript
import { TwitterClient, TweetGenerator } from '@ai16z/client-twitter';

class CustomTweetGenerator implements TweetGenerator {
    async generateTweet(): Promise<string> {
        // Your custom tweet generation logic
        return 'Custom generated tweet content';
    }
}

const client = new TwitterClient({
    // ... API credentials ...
    tweetGenerator: new CustomTweetGenerator()
});
```

## Best Practices

### Error Handling

Implement comprehensive error handling:

```typescript
client.on('error', (error) => {
    if (error.code === 'RATE_LIMIT_EXCEEDED') {
        console.error('Rate limit exceeded, waiting before retry');
    } else if (error.code === 'APPROVAL_TIMEOUT') {
        console.error('Tweet approval timed out:', error.tweetId);
    } else {
        console.error('Unexpected error:', error);
    }
});
```

### Monitoring and Logging

```typescript
client.on('tweet:pending', (tweet) => {
    logEvent('tweet_pending', tweet);
    notifyAdmins(`New tweet pending approval: ${tweet.content}`);
});

client.on('tweet:approved', (tweet) => {
    logEvent('tweet_approved', tweet);
    updateMetrics('approved_tweets', 1);
});
```

### Queue Management

Regular cleanup of old tweets:

```typescript
// Clean up tweets older than 7 days
const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
setInterval(async () => {
    await client.approvalQueue.cleanupOld(WEEK_IN_MS);
}, WEEK_IN_MS);
```

## Troubleshooting

### Common Issues

1. **Rate Limiting**
   ```typescript
   client.on('error', (error) => {
       if (error.code === 'RATE_LIMIT_EXCEEDED') {
           const resetTime = error.resetAt - Date.now();
           setTimeout(() => client.resume(), resetTime);
       }
   });
   ```

2. **Network Issues**
   ```typescript
   client.on('error', async (error) => {
       if (error.code === 'NETWORK_ERROR') {
           console.error('Network error, retrying in 5 minutes');
           await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
           await client.reconnect();
       }
   });
   ```

3. **Database Issues**
   ```typescript
   // Backup queue database periodically
   import { backup } from '@ai16z/client-twitter/utils';

   setInterval(async () => {
       await backup('./queue.db', './backups/queue.db');
   }, 24 * 60 * 60 * 1000); // Daily backup
   ```

### Debugging

Enable debug logging:

```typescript
const client = new TwitterClient({
    // ... API credentials ...
    debug: true,
    logLevel: 'debug'
});

// Or use environment variables
process.env.DEBUG = 'ai16z:client-twitter:*';
```

### Health Checks

Implement regular health checks:

```typescript
setInterval(async () => {
    try {
        const status = await client.healthCheck();
        if (!status.healthy) {
            console.error('Health check failed:', status.issues);
            notifyAdmins(`Twitter client health check failed: ${status.issues.join(', ')}`);
        }
    } catch (error) {
        console.error('Health check error:', error);
    }
}, 5 * 60 * 1000); // Every 5 minutes
```

For more information and updates, visit the [GitHub repository](https://github.com/ai16z/eliza) or join our [Discord community](https://discord.gg/ai16z).
