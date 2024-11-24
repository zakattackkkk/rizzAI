import { describe, it, expect } from 'vitest';
import { NeynarAPI } from '../src/agent-farcaster-client/neynar-api';
import dotenv from 'dotenv';
import { Cast } from '../src/agent-farcaster-client/casts';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env.test') });

// Environment variables
const SIGNER_UUID = process.env.FARCASTER_SIGNER_UUID;
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
const TEST_USERNAME = process.env.FARCASTER_USERNAME;
const TEST_FID = parseInt(process.env.FARCASTER_USER_FID || '0', 10);
const DRY_RUN = process.env.FARCASTER_DRY_RUN === 'true';

if (!NEYNAR_API_KEY || !SIGNER_UUID || !TEST_USERNAME || !TEST_FID) {
  throw new Error('Required environment variables NEYNAR_API_KEY, SIGNER_UUID, FARCASTER_USERNAME, and FARCASTER_USER_FID must be set');
}

describe('NeynarAPI Integration Tests', () => {
  const api = new NeynarAPI(
    SIGNER_UUID,
    NEYNAR_API_KEY,
    TEST_FID,
    TEST_USERNAME,
    DRY_RUN // dryRun = true for dry run API calls
  );

  it('should fetch a user profile', async () => {
    const profile = await api.getProfile();
    
    expect(profile).toBeDefined();
    expect(profile.username).toBe(TEST_USERNAME);
    expect(profile.fid).toBe(TEST_FID);
  });

  it('should fetch user tweets', async () => {
    let tweets: Cast[] = [];
    for await (const tweet of api.getTweets(TEST_FID.toString(), 5)) {
      tweets.push(tweet);
    }

    expect(tweets.length).toBeGreaterThan(0);
    expect(tweets[0]).toHaveProperty('text');
    expect(tweets[0]).toHaveProperty('hash');
  });

  it('should fetch a specific tweet', async () => {
    // First get a tweet hash from recent tweets
    const recentTweets = [];
    for await (const tweet of api.getTweets(TEST_FID.toString(), 1)) {
      recentTweets.push(tweet);
    }
    
    const tweetHash = recentTweets[0].hash;
    const tweet = await api.getTweet(tweetHash);

    expect(tweet).toBeDefined();
    expect(tweet?.hash).toBe(tweetHash);
    expect(tweet?.text).toBeDefined();
  });

  it('should fetch followers', async () => {
    const followers = await api.fetchProfileFollowers(
      TEST_FID.toString(),
      1
    );

    expect(followers).toBeDefined();
    expect(followers.users).toBeDefined();
    expect(followers.users.length).toBeGreaterThan(0);
  });

  it('should fetch following', async () => {
    const following = await api.fetchProfileFollowing(10);

    expect(following).toBeDefined();
    expect(following.users).toBeDefined();
    expect(following.users.length).toBeGreaterThan(0);
  });

  it('should fetch home timeline', async () => {
    const timeline = await api.fetchHomeTimeline(1, []);

    expect(timeline).toBeDefined();
    expect(Array.isArray(timeline)).toBe(true);
    expect(timeline.length).toBeGreaterThan(0);
    expect(timeline[0]).toHaveProperty('text');
    expect(timeline[0]).toHaveProperty('hash');
  });
}); 