import { Profile } from './profile.ts';
import { QueryProfilesResponse, QueryTweetsResponse } from './timeline-v1.ts';
import { getTweetTimeline, getUserTimeline } from './timeline-async.ts';
import { Cast } from './casts.ts';
import {
    SearchTimeline,
    parseSearchTimelineTweets,
    parseSearchTimelineUsers,
} from './timeline-search.ts';

/**
 * The categories that can be used in Twitter searches.
 */
export enum SearchMode {
    Top,
    Latest,
    Photos,
    Videos,
    Users,
}

export function searchTweets(
    query: string,
    maxTweets: number,
    searchMode: SearchMode,
): AsyncGenerator<Cast, void> {
    return getTweetTimeline(query, maxTweets, (q, mt, c) => {
        return fetchSearchCasts(q, mt, searchMode, c);
    });
}

export async function fetchSearchCasts(
    query: string,
    maxTweets: number,
    searchMode: SearchMode,
    cursor?: string,
): Promise<QueryTweetsResponse> {
    const timeline = await getSearchTimeline(
        query,
        maxTweets,
        searchMode,
        cursor,
    );

    return parseSearchTimelineTweets(timeline);
}

export async function fetchSearchProfiles(
    query: string,
    maxProfiles: number,
    cursor?: string,
): Promise<QueryProfilesResponse> {
    const timeline = await getSearchTimeline(
        query,
        maxProfiles,
        SearchMode.Users,
        cursor,
    );

    return parseSearchTimelineUsers(timeline);
}

async function getSearchTimeline(
    query: string,
    maxItems: number,
    searchMode: SearchMode,
    cursor?: string,
): Promise<SearchTimeline> {

    if (maxItems > 50) {
        maxItems = 50;
    }

    const variables: Record<string, any> = {
        rawQuery: query,
        count: maxItems,
        querySource: 'typed_query',
        product: 'Top',
    };

    const fieldToggles: Record<string, any> = {
        withArticleRichContentState: false,
    };

    if (cursor != null && cursor != '') {
        variables['cursor'] = cursor;
    }

    switch (searchMode) {
        case SearchMode.Latest:
            variables.product = 'Latest';
            break;
        case SearchMode.Photos:
            variables.product = 'Photos';
            break;
        case SearchMode.Videos:
            variables.product = 'Videos';
            break;
        case SearchMode.Users:
            variables.product = 'People';
            break;
        default:
            break;
    }

    const params = new URLSearchParams();
    return {} as SearchTimeline;
    // if (!res.success) {
    //     throw new Error('Failed to get search timeline');
    // }

    // return res.value;
}
