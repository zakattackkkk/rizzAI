import { Profile } from './profile.ts';
import { QueryProfilesResponse } from './timeline-v1.ts';
import { getUserTimeline } from './timeline-async.ts';
import {
  RelationshipTimeline,
  parseRelationshipTimeline,
} from './timeline-relationship.ts';

export function getFollowing(
  userId: string,
  maxProfiles: number,
): AsyncGenerator<Profile, void> {
  return getUserTimeline(userId, maxProfiles, (q, mt, c) => {
    return fetchProfileFollowing(q, mt, c);
  });
}

export function getFollowers(
  userId: string,
  maxProfiles: number,
): AsyncGenerator<Profile, void> {
  return getUserTimeline(userId, maxProfiles, (q, mt, c) => {
    return fetchProfileFollowers(q, mt, c);
  });
}

export async function fetchProfileFollowing(
  userId: string,
  maxProfiles: number,
  cursor?: string,
): Promise<QueryProfilesResponse> {
  const timeline = await getFollowingTimeline(
    userId,
    maxProfiles,
    cursor,
  );

  return parseRelationshipTimeline(timeline);
}

export async function fetchProfileFollowers(
  userId: string,
  maxProfiles: number,
  cursor?: string,
): Promise<QueryProfilesResponse> {
  const timeline = await getFollowersTimeline(
    userId,
    maxProfiles,
    cursor,
  );

  return parseRelationshipTimeline(timeline);
}

async function getFollowingTimeline(
  userId: string,
  maxItems: number,
  cursor?: string,
): Promise<RelationshipTimeline> {

  if (maxItems > 50) {
    maxItems = 50;
  }

  return {} as RelationshipTimeline;
}

async function getFollowersTimeline(
  userId: string,
  maxItems: number,
  cursor?: string,
): Promise<RelationshipTimeline> {
  
  if (maxItems > 50) {
    maxItems = 50;
  }

  return {} as RelationshipTimeline;
}
