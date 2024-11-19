import { TwitterAuth } from './auth.ts';
import { Profile, getUserIdByScreenName } from './profile.ts';
import { QueryProfilesResponse } from './timeline-v1.ts';
import { getUserTimeline } from './timeline-async.ts';

export function getFollowing(
  userId: string,
  maxProfiles: number,
  auth: TwitterAuth,
): AsyncGenerator<Profile, void> {
  return getUserTimeline(userId, maxProfiles, (q, mt, c) => {
    return fetchProfileFollowing(q, mt, auth, c);
  });
}

export function getFollowers(
  userId: string,
  maxProfiles: number,
  auth: TwitterAuth,
): AsyncGenerator<Profile, void> {
  return getUserTimeline(userId, maxProfiles, (q, mt, c) => {
    return fetchProfileFollowers(q, mt, auth, c);
  });
}

export async function fetchProfileFollowing(
  userId: string,
  maxProfiles: number,
  auth: TwitterAuth,
  cursor?: string,
): Promise<QueryProfilesResponse> {
  const timeline = await getFollowingTimeline(
    userId,
    maxProfiles,
    auth,
    cursor,
  );

  return parseRelationshipTimeline(timeline);
}

export async function fetchProfileFollowers(
  userId: string,
  maxProfiles: number,
  auth: TwitterAuth,
  cursor?: string,
): Promise<QueryProfilesResponse> {
  const timeline = await getFollowersTimeline(
    userId,
    maxProfiles,
    auth,
    cursor,
  );

  return parseRelationshipTimeline(timeline);
}

async function getFollowingTimeline(
  userId: string,
  maxItems: number,
  auth: TwitterAuth,
  cursor?: string,
): Promise<RelationshipTimeline> {
  if (!auth.isLoggedIn()) {
    throw new Error('Scraper is not logged-in for profile following.');
  }

  if (maxItems > 50) {
    maxItems = 50;
  }

}

async function getFollowersTimeline(
  userId: string,
  maxItems: number,
  auth: TwitterAuth,
  cursor?: string,
): Promise<RelationshipTimeline> {
  if (!auth.isLoggedIn()) {
    throw new Error('Scraper is not logged-in for profile followers.');
  }

  if (maxItems > 50) {
    maxItems = 50;
  }


}
