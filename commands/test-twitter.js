import { TwitterPostClient } from './packages/client-twitter/dist/index.js';

const runtime = {
    agentId: 'test-agent',
    character: {
        name: 'Test Bot',
        templates: {
            twitterPostTemplate: `Write a friendly test tweet to verify the integration is working.`
        }
    },
    getSetting: (key) => {
        return process.env[key];
    },
    ensureUserExists: async () => true,
    composeState: async () => ({}),
    messageManager: {
        createMemory: async () => ({})
    }
};

const client = new TwitterPostClient(runtime);
client.onReady();
