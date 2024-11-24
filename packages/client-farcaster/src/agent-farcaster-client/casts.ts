import { QueryTweetsResponse } from './timeline-v1.ts';
import {
  parseTimelineTweetsV2,
  parseThreadedConversation,
} from './timeline-v2.ts';
import { getTweetTimeline } from './timeline-async.ts';

import { parseListTimelineTweets } from './timeline-list.ts';
import { CastWithInteractions } from '@neynar/nodejs-sdk/build/neynar-api/v2/openapi-farcaster/models/cast-with-interactions';

export interface Mention {
  id: string;
  username?: string;
  name?: string;
}

export interface Photo {
  id: string;
  url: string;
  alt_text: string | undefined;
}

export interface Video {
  id: string;
  preview: string;
  url?: string;
}

export interface PlaceRaw {
  id?: string;
  place_type?: string;
  name?: string;
  full_name?: string;
  country_code?: string;
  country?: string;
  bounding_box?: {
    type?: string;
    coordinates?: number[][][];
  };
}

/**
 * A parsed Cast object.
 */
export interface Cast {
  bookmarkCount?: number;
  conversationId?: string;
  hashtags: string[];
  html?: string;
  id?: string;
  inReplyToStatus?: Cast;
  inReplyToStatusId?: string;
  isQuoted?: boolean;
  isPin?: boolean;
  isReply?: boolean;
  isRetweet?: boolean;
  isSelfThread?: boolean;
  likes?: number;
  name?: string;
  mentions: Mention[];
  permanentUrl?: string;
  photos: Photo[];
  place?: PlaceRaw;
  quotedStatus?: Cast;
  quotedStatusId?: string;
  replies?: number;
  retweets?: number;
  retweetedStatus?: Cast;
  retweetedStatusId?: string;
  text?: string;
  thread: Cast[];
  timeParsed?: Date;
  timestamp?: number;
  urls: string[];
  userId?: string;
  username?: string;
  videos: Video[];
  views?: number;
  sensitiveContent?: boolean;
}

export function castFromNeynar(cast: CastWithInteractions): Cast {
  return {
    id: cast.hash,
    inReplyToStatusId: cast.parent_hash ?? undefined,
    permanentUrl: cast.parent_url ?? undefined,
    quotedStatusId: cast.root_parent_url ?? undefined,
    userId: `${cast.author.fid}`,
    username: cast.author.username,
    text: cast.text,
    timestamp: new Date(cast.timestamp).getTime(),
    likes: cast.reactions.likes_count,
    retweets: cast.reactions.recasts_count,
    replies: cast.replies.count,
    mentions: [],
    hashtags: [],
    photos: [],
    videos: [],
    urls: [],
    thread: [],
  };
}

export type TweetQuery =
  | Partial<Cast>
  | ((cast: Cast) => boolean | Promise<boolean>);


export async function fetchTweets(
  userId: string,
  maxTweets: number,
  cursor: string | undefined,
): Promise<QueryTweetsResponse> {
  if (maxTweets > 200) {
    maxTweets = 200;
  }

  const userTweetsRequest = {} as any; //apiRequestFactory.createUserTweetsRequest();
  userTweetsRequest.variables.userId = userId;
  userTweetsRequest.variables.count = maxTweets;
  userTweetsRequest.variables.includePromotedContent = false; // true on the website

  if (cursor != null && cursor != '') {
    userTweetsRequest.variables['cursor'] = cursor;
  }
  

  return parseTimelineTweetsV2({});
}

export async function fetchTweetsAndReplies(
  userId: string,
  maxTweets: number,
  cursor: string | undefined,
): Promise<QueryTweetsResponse> {
  if (maxTweets > 40) {
    maxTweets = 40;
  }

  const userTweetsRequest = {} as any; //apiRequestFactory.createUserTweetsAndRepliesRequest();
  userTweetsRequest.variables.userId = userId;
  userTweetsRequest.variables.count = maxTweets;
  userTweetsRequest.variables.includePromotedContent = false; // true on the website


  return parseTimelineTweetsV2({});
}

export async function fetchListTweets(
  listId: string,
  maxTweets: number,
  cursor: string | undefined,
): Promise<QueryTweetsResponse> {
  if (maxTweets > 200) {
    maxTweets = 200;
  }

  const listTweetsRequest = {} as any; //apiRequestFactory.createListTweetsRequest();
  listTweetsRequest.variables.listId = listId;
  listTweetsRequest.variables.count = maxTweets;

  if (cursor != null && cursor != '') {
    listTweetsRequest.variables['cursor'] = cursor;
  }

  return parseListTimelineTweets({});
}

export function getTweets(
  user: string,
  maxTweets: number,
): AsyncGenerator<Cast, void> {
  async function* emptyGenerator(): AsyncGenerator<Cast, void> {
    return;
  }
  return emptyGenerator();
}

export function getTweetsByUserId(
  userId: string,
  maxTweets: number,
): AsyncGenerator<Cast, void> {
  return getTweetTimeline(userId, maxTweets, (q, mt, c) => {
    return fetchTweets(q, mt, c);
  });
}

export function getTweetsAndReplies(
  user: string,
  maxTweets: number,
): AsyncGenerator<Cast, void> {
  async function* emptyGenerator(): AsyncGenerator<Cast, void> {
    return;
  }
  return emptyGenerator();
}

export function getTweetsAndRepliesByUserId(
  userId: string,
  maxTweets: number,
): AsyncGenerator<Cast, void> {
  return getTweetTimeline(userId, maxTweets, (q, mt, c) => {
    return fetchTweetsAndReplies(q, mt, c);
  });
}

export async function fetchLikedTweets(
  userId: string,
  maxTweets: number,
  cursor: string | undefined,
): Promise<QueryTweetsResponse> {
  
  if (maxTweets > 200) {
    maxTweets = 200;
  }

  const userTweetsRequest = {} as any; //apiRequestFactory.createUserLikedTweetsRequest();
  userTweetsRequest.variables.userId = userId;
  userTweetsRequest.variables.count = maxTweets;
  userTweetsRequest.variables.includePromotedContent = false; // true on the website

  if (cursor != null && cursor != '') {
    userTweetsRequest.variables['cursor'] = cursor;
  }


  return parseTimelineTweetsV2({});
}

export async function getTweetWhere(
  tweets: AsyncIterable<Cast>,
  query: TweetQuery,
): Promise<Cast | null> {
  const isCallback = typeof query === 'function';

  for await (const tweet of tweets) {
    const matches = isCallback
      ? await query(tweet)
      : checkTweetMatches(tweet, query);

    if (matches) {
      return tweet;
    }
  }

  return null;
}

function checkTweetMatches(tweet: Cast, options: Partial<Cast>): boolean {
  return Object.keys(options).every((k) => {
    const key = k as keyof Cast;
    return tweet[key] === options[key];
  });
}

export async function getLatestTweet(
  user: string,
  includeRetweets: boolean,
  max: number,
): Promise<Cast | null | void> {
  const timeline = getTweets(user, max);

  // No point looping if max is 1, just use first entry.
  return max === 1
    ? (await timeline.next()).value
    : await getTweetWhere(timeline, { isRetweet: includeRetweets });
}

export async function getTweet(
  id: string,
): Promise<Cast | null> {
  const tweetDetailRequest = {} as any; //apiRequestFactory.createTweetDetailRequest();
  tweetDetailRequest.variables.focalTweetId = id;

  // const res = await requestApi<ThreadedConversation>(
  //   tweetDetailRequest.toRequestUrl(),
  // );

  // if (!res.success) {
  //   throw new Error('Failed to get tweet detail');
  // }

  // if (!res.value) {
  //   return null;
  // }

  const tweets = parseThreadedConversation({});
  return tweets.find((tweet) => tweet.id === id) ?? null;
}