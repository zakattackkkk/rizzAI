import { TwitterApiErrorRaw } from './errors';

export interface NeynarUser {
  object?: string;
  fid?: number;
  username?: string;
  display_name?: string;
  custody_address?: string;
  pfp_url?: string;
  profile?: {
    bio?: {
      text?: string;
      mentioned_profiles?: string[];
    };
    location?: {
      latitude?: number;
      longitude?: number;
      address?: {
        city?: string;
        state?: string;
        state_code?: string;
        country?: string;
        country_code?: string;
      };
    };
  };
  follower_count?: number;
  following_count?: number;
  verifications?: string[];
  verified_addresses?: {
    eth_addresses?: string[];
    sol_addresses?: string[];
  };
  verified_accounts?: {
    platform?: string;
    username?: string;
  }[];
  power_badge?: boolean;
  experimental?: {
    neynar_user_score?: number;
  };
  viewer_context?: {
    following?: boolean;
    followed_by?: boolean;
    blocking?: boolean;
    blocked_by?: boolean;
  };
}
/**
 * A parsed profile object.
 */
export interface Profile {
  avatar?: string;
  banner?: string;
  biography?: string;
  birthday?: string;
  followersCount?: number;
  followingCount?: number;
  friendsCount?: number;
  mediaCount?: number;
  statusesCount?: number;
  isPrivate?: boolean;
  isVerified?: boolean;
  isBlueVerified?: boolean;
  joined?: Date;
  likesCount?: number;
  listedCount?: number;
  location?: string;
  name?: string;
  pinnedTweetIds?: string[];
  tweetsCount?: number;
  url?: string;
  userId?: string;
  username?: string;
  website?: string;
  canDm?: boolean;
}

export interface UserRaw {
  data: {
    user: {
      result: {
        rest_id?: string;
        is_blue_verified?: boolean;
        legacy: NeynarUser;
      };
    };
  };
  errors?: TwitterApiErrorRaw[];
}

export function parseProfile(
  user: NeynarUser,
): Profile {
  const profile: Profile = {
    avatar: user.pfp_url,
    banner: null, // NeynarUser does not have a profile banner URL
    biography: user.profile?.bio?.text,
    followersCount: user.follower_count,
    followingCount: user.following_count,
    friendsCount: user.following_count,
    mediaCount: null, // NeynarUser does not provide media count
    isPrivate: false, // NeynarUser does not have privacy indication
    isVerified: user.verifications?.length > 0 || false,
    likesCount: null, // NeynarUser does not provide likes count
    listedCount: null, // NeynarUser does not provide listed count
    location: user.profile?.location?.address?.city ?? user.profile?.location?.address?.state ?? null,
    name: user.display_name,
    pinnedTweetIds: null, // NeynarUser does not have pinned tweets
    tweetsCount: null, // NeynarUser does not provide tweet count
    url: `https://warpcast.com/${user.username}`,
    userId: user.fid?.toString(),
    username: user.username,
    isBlueVerified: user.power_badge ?? false, // using power badge in lieu of blue verified
    canDm: false, // NeynarUser does not provide DM capability information
  };

  if (user.profile?.location?.latitude && user.profile?.location?.longitude) {
    profile.location = `${user.profile.location.address?.city}, ${user.profile.location.address?.country}`;
  }

  return profile;
}

const idCache = new Map<string, string>();
