import {  QueryTweetsResponse } from './timeline-v1.ts';
import {
  Cast,
  TweetQuery,
} from './casts.ts';
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { type PostCastResponseCast } from '@neynar/nodejs-sdk/build/neynar-api/v2/openapi-farcaster/models/post-cast-response-cast'
import { FollowersResponse } from '@neynar/nodejs-sdk/build/neynar-api/v2/openapi-farcaster/models/followers-response';
import { FollowSortType, CastParamType } from '@neynar/nodejs-sdk';
import { parseProfile, Profile } from './profile.ts';
import { castFromNeynar } from './casts.ts';

/**
 * An interface to the farcaster Neynar API.
 */
export class NeynarAPI {
  private neynarApiKey: string;
  private signerUuid: string;
  private farcasterUserFID: number;
  private farcasterUsername: string;
  private dryRun: boolean;
  private client: NeynarAPIClient;
  /**
   * Creates a new Scraper object.
   * - Scrapers maintain their own guest tokens for Farcaster's internal API.
   * - Reusing Scraper objects is recommended to minimize the time spent authenticating unnecessarily.
   */
  constructor(
    signerUuid: string,
    apiKey: string,
    farcasterUserFID: number,
    farcasterUsername: string,
    dryRun: boolean
  ) {
    this.signerUuid = signerUuid;
    this.neynarApiKey = apiKey;
    this.farcasterUserFID = farcasterUserFID;
    this.farcasterUsername = farcasterUsername;
    this.dryRun = dryRun;
    this.client = new NeynarAPIClient(this.neynarApiKey);
  }

  /**
   * Logs the current state of the API client and any additional data
   * @param functionName Name of the current function being executed
   * @param additionalData Optional object containing additional data to log
   * @param mask Whether to mask sensitive data like API keys (default: true)
   */
  public logState(functionName?: string, additionalData?: Record<string, any>, mask: boolean = true): void {
    const state = {
      function: functionName,
      signerUuid: mask ? `${this.signerUuid.slice(0, 4)}...${this.signerUuid.slice(-4)}` : this.signerUuid,
      apiKey: mask ? `${this.neynarApiKey.slice(0, 4)}...${this.neynarApiKey.slice(-4)}` : this.neynarApiKey,
      farcasterUserFID: this.farcasterUserFID,
      farcasterUsername: this.farcasterUsername,
      dryRun: this.dryRun,
      ...(additionalData && { additionalData })
    };

    console.log('Invoked NeynarAPI with state:', JSON.stringify(state, null, 2));
  }

  /**
   * Fetches a Farcaster profile.
   * @param username The farcaster username of the profile to fetch, without an `@` at the beginning.
   * @returns The requested {@link Profile}.
   */
  public async getProfile(): Promise<any> {
    if (this.dryRun) {
      this.logState('getProfile');
      return;
    }
    const res = await this.client.lookupUserByUsernameV2(this.farcasterUsername);
    const userData = res.user;
    if (!userData) {
      throw new Error('User not found');
    }

    const user = parseProfile(userData);
    return parseProfile(user);
  }

  /**
   * Fetches the user ID corresponding to the provided screen name.
   * @param screenName The Farcaster username of the profile to fetch.
   * @returns The ID of the corresponding account.
   */
  public async getUserId(): Promise<string> {
    if (this.dryRun) {
      this.logState('getUserId');
      return;
    }
    const res = await this.client.lookupUserByUsernameV2(this.farcasterUsername);
    return res.user?.fid.toString() || '';
  }

  /**
   * Fetches tweets from farcaster.
   * @param query The search query. Any farcaster-compatible query format can be used.
   * @param maxTweets The maximum number of tweets to return.
   * @param includeReplies Whether or not replies should be included in the response.
   * @param searchMode The category filter to apply to the search. Defaults to `Top`.
   * @returns An {@link AsyncGenerator} of tweets matching the provided filters.
   */
  public async *searchTweets(
    query: string,
    maxTweets: number,
  ): AsyncGenerator<Cast, void> {
    if (this.dryRun) {
      this.logState('searchTweets', { query, maxTweets });
      return;
    }
    const res = await this.client.fetchFeedForYou(this.farcasterUserFID, {limit: 1});
    const casts = res.casts;
    for (const cast of casts) {
      yield castFromNeynar(cast); 
    }
  }

  /**
   * Fetches casts from Farcaster.
   * @param query The search query. Any Farcaster-compatible query format can be used.
   * @param maxTweets The maximum number of tweets to return.
   * @param includeReplies Whether or not replies should be included in the response.
   * @param searchMode The category filter to apply to the search. Defaults to `Top`.
   * @param cursor The search cursor, which can be passed into further requests for more results.
   * @returns A page of results, containing a cursor that can be used in further requests.
   */
  public async fetchSearchCasts(
    query: string,
    maxTweets: number,
    cursor?: string,
  ): Promise<QueryTweetsResponse> {
    if (this.dryRun) {
      this.logState('fetchSearchCasts', { query, maxTweets, cursor });
      return;
    }
    const client = new NeynarAPIClient(this.neynarApiKey);
    const res = await client.lookupUserByUsernameV2(query);
    const userData = res.user;
    if (!userData) {
      throw new Error('User not found');
    }
    return;
  }

  /**
   * Fetches following profiles from Farcaster.
   * @param userId The user whose following should be returned
   * @param maxProfiles The maximum number of profiles to return.
   * @param cursor The search cursor, which can be passed into further requests for more results.
   * @returns A page of results, containing a cursor that can be used in further requests.
   */
  public async fetchProfileFollowing(
    maxProfiles: number,
    cursor?: string,
  ): Promise<FollowersResponse> {
    if (this.dryRun) {
      this.logState('fetchProfileFollowing', { maxProfiles, cursor });
      return;
    }
    return await this.client.fetchUserFollowingV2(this.farcasterUserFID, {viewerFid: this.farcasterUserFID, sortType: FollowSortType.DescChron, limit: maxProfiles, cursor});
  }

  /**
   * Fetches profile followers from Farcaster.
   * @param userId The user whose following should be returned
   * @param maxProfiles The maximum number of profiles to return.
   * @param cursor The search cursor, which can be passed into further requests for more results.
   * @returns A page of results, containing a cursor that can be used in further requests.
   */
  public async fetchProfileFollowers(
    userId: string,
    maxProfiles: number,
    cursor?: string,
  ): Promise<FollowersResponse> {
    if (this.dryRun) {
      this.logState('fetchProfileFollowers', { maxProfiles, cursor });
      return;
    }
    return await this.client.fetchUserFollowersV2(this.farcasterUserFID, {limit: maxProfiles, cursor});
  }

  /**
   * Fetches the home timeline for the current user.
   * @param count The number of tweets to fetch.
   * @param seenTweetIds An array of tweet IDs that have already been seen.
   * @returns A promise that resolves to the home timeline response.
   */
  public async fetchHomeTimeline(
    count: number,
    seenTweetIds: string[],
  ): Promise<Cast[]> {
    if (this.dryRun) {
      this.logState('fetchHomeTimeline', { count, seenTweetIds });
      return;
    }
    try {
      const response = await this.client.fetchFeedForYou(this.farcasterUserFID, {limit: count});
      return response.casts.map(castFromNeynar);
    } catch (error) {
      console.error('Failed to send cast:', error);
      throw error;
    }
  }

  async getUserTweets(
    userId: string,
    maxTweets = 200,
    cursor?: string,
  ): Promise<{ casts: Cast[]; next?: string }> {
    if (this.dryRun) {
      this.logState('getUserTweets', { userId, maxTweets, cursor });
      return;
    }
    if (maxTweets > 200) {
      maxTweets = 200;
    }

    const res = await this.client.fetchCastsForUser(+userId, {limit: maxTweets});
    return { casts: res.casts.map(castFromNeynar), next: undefined };
  }

  async *getUserTweetsIterator(
    userId: string,
    maxTweets = 200,
  ): AsyncGenerator<Cast, void> {
    if (this.dryRun) {
      this.logState('getUserTweetsIterator', { userId, maxTweets });
      return;
    }
    let cursor: string | undefined;
    let retrievedTweets = 0;

    while (retrievedTweets < maxTweets) {
      const response = await this.getUserTweets(
        userId,
        maxTweets - retrievedTweets,
        cursor,
      );

      for (const cast of response.casts) {
        yield cast;
        retrievedTweets++;
        if (retrievedTweets >= maxTweets) {
          break;
        }
      }

      cursor = response.next;

      if (!cursor) {
        break;
      }
    }
  }

    /**
   * Fetches tweets from a Farcaster user.
   * @param user The user whose tweets should be returned.
   * @param maxTweets The maximum number of tweets to return. Defaults to `200`.
   * @returns An {@link AsyncGenerator} of tweets from the provided user.
   */
    public async *getTweets(user: string, maxTweets = 200): AsyncGenerator<Cast> {
      if (this.dryRun) {
        this.logState('getTweets', { user, maxTweets });
        return;
      }
      const res = await this.client.fetchCastsForUser(+user, {limit: maxTweets});
      for (const cast of res.casts) {
        yield castFromNeynar(cast);
      }
    }

  /**
   * Fetches tweets from a Farcaster user using their ID.
   * @param userId The user whose tweets should be returned.
   * @param maxTweets The maximum number of tweets to return. Defaults to `200`.
   * @returns An {@link AsyncGenerator} of tweets from the provided user.
   */
  public async *getTweetsByUserId(
    userId: string,
    maxTweets = 200,
  ): AsyncGenerator<Cast, void> {
    if (this.dryRun) {
      this.logState('getTweetsByUserId', { userId, maxTweets });
      return;
    }
    // Simulate fetching tweets
    for (let i = 0; i < maxTweets; i++) {
      yield { /* ... tweet data ... */ } as Cast; // Replace with actual tweet data
    }
  }

  /**
   * Send a tweet
   * @param text The text of the tweet
   * @param tweetId The id of the tweet to reply to
   * @returns
   */

  async sendCast(text: string, replyToTweetId?: string): Promise<PostCastResponseCast> {
    if (this.dryRun) {
      this.logState('sendCast', { text, replyToTweetId });
      return;
    }
    try {
      const response = await this.client.publishCast(this.signerUuid, text, {replyTo: replyToTweetId});
      return response;
    } catch (error) {
      console.error('Failed to send cast:', error);
      throw error;
    }
  }

  /**
   * Fetches tweets and replies from a Farcaster user.
   * @param user The user whose tweets should be returned.
   * @param maxTweets The maximum number of tweets to return. Defaults to `200`.
   * @returns An {@link AsyncGenerator} of tweets from the provided user.
   */
  public async *getTweetsAndReplies(
    user: string,
    maxTweets = 200,
  ): AsyncGenerator<Cast> {
    if (this.dryRun) {
      this.logState('getTweetsAndReplies', { user, maxTweets });
      return;
    }
    const res = await this.client.fetchCastsForUser(+user, {limit: maxTweets, includeReplies: true});
    for (const cast of res.casts) {
      yield castFromNeynar(cast);
    }
  }

  /**
   * Fetches tweets and replies from a Farcaster user using their ID.
   * @param userId The user whose tweets should be returned.
   * @param maxTweets The maximum number of tweets to return. Defaults to `200`.
   * @returns An {@link AsyncGenerator} of tweets from the provided user.
   */
  public async *getTweetsAndRepliesByUserId(
    userId: string,
    maxTweets = 200,
  ): AsyncGenerator<Cast, void> {
    if (this.dryRun) {
      this.logState('getTweetsAndRepliesByUserId', { userId, maxTweets });
      return;
    }
    // Simulate fetching tweets and replies
    for (let i = 0; i < maxTweets; i++) {
      yield { /* ... tweet data ... */ } as Cast; // Replace with actual tweet data
    }
  }

  /**
   * Fetches the first tweet matching the given query.

   * @param tweets The {@link AsyncIterable} of tweets to search through.
   * @param query A query to test **all** tweets against. This may be either an
   * object of key/value pairs or a predicate. If this query is an object, all
   * key/value pairs must match a {@link Cast} for it to be returned. If this query
   * is a predicate, it must resolve to `true` for a {@link Cast} to be returned.
   * - All keys are optional.
   * - If specified, the key must be implemented by that of {@link Cast}.
   */
  public async getTweetsWhere(
    tweets: AsyncIterable<Cast>,
    query: TweetQuery,
  ): Promise<Cast[]> {
    const isCallback = typeof query === 'function';
    const filtered = [];
  
    for await (const tweet of tweets) {
      const matches = isCallback ? query(tweet) : this.checkTweetMatches(tweet, query);
  
      if (!matches) continue;
      filtered.push(tweet);
    }
  
    return filtered;
  }
  
  public checkTweetMatches(tweet: Cast, options: Partial<Cast>): boolean {
    return Object.keys(options).every((k) => {
      const key = k as keyof Cast;
      return tweet[key] === options[key];
    });
  }

  /**
   * Fetches the most recent tweet from a Farcaster user.
   * @param user The user whose latest tweet should be returned.
   * @param includeRetweets Whether or not to include retweets. Defaults to `false`.
   * @returns The {@link Cast} object or `null`/`undefined` if it couldn't be fetched.
   */
  public async getLatestTweet(
    user: string,
    includeRetweets = false,
  ): Promise<Cast | null | void> {
    if (this.dryRun) {
      this.logState('getLatestTweet', { user, includeRetweets });
      return;
    }
    const res = await this.client.fetchCastsForUser(+user, {limit: 1, includeReplies: includeRetweets});
    return castFromNeynar(res.casts[0]);
  }

  /**
   * Fetches a single tweet.
   * @param id The ID of the tweet to fetch.
   * @returns The {@link Cast} object, or `null` if it couldn't be fetched.
   */
  public async getTweet(id: string): Promise<Cast | null> {
    if (this.dryRun) {
      this.logState('getTweet', { id });
      return;
    }
    const res = await this.client.lookUpCastByHashOrWarpcastUrl(id, CastParamType.Hash, {viewerFid: +this.farcasterUserFID});
    return castFromNeynar(res.cast);
  }
}