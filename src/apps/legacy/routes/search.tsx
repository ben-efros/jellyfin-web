import type { CollectionType } from '@jellyfin/sdk/lib/generated-client/models/collection-type';
import React, { type FC } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounceValue } from 'usehooks-ts';

import SearchFields from 'apps/legacy/features/search/components/SearchFields';
import SearchResults from 'apps/legacy/features/search/components/SearchResults';
import SearchSuggestions from 'apps/legacy/features/search/components/SearchSuggestions';
import Page from 'components/Page';
import useSearchParam from 'hooks/useSearchParam';
import globalize from 'lib/globalize';

const COLLECTION_TYPE_PARAM = 'collectionType';
const PARENT_ID_PARAM = 'parentId';
const QUERY_PARAM = 'query';

// Below this length, a search term matches too broadly to be useful and is expensive to
// run server-side (item search uses a leading-wildcard LIKE query, which can't use an index
// and falls back to a full table scan). Waiting for a couple characters avoids firing that
// scan repeatedly while a user is still typing the first letters of their query.
const MIN_SEARCH_LENGTH = 2;

const Search: FC = () => {
    const [searchParams] = useSearchParams();
    const parentIdQuery = searchParams.get(PARENT_ID_PARAM) || undefined;
    const collectionTypeQuery = (searchParams.get(COLLECTION_TYPE_PARAM) || undefined) as CollectionType | undefined;
    const [ query, setQuery ] = useSearchParam(QUERY_PARAM);
    const [debouncedQuery] = useDebounceValue(query, 500);
    const trimmedDebouncedQuery = debouncedQuery?.trim();
    const isQueryTooShort = !!trimmedDebouncedQuery && trimmedDebouncedQuery.length < MIN_SEARCH_LENGTH;

    return (
        <Page
            id='searchPage'
            title={globalize.translate('Search')}
            className='mainAnimatedPage libraryPage allLibraryPage noSecondaryNavPage'
        >
            <SearchFields query={query} onSearch={setQuery} />
            {!trimmedDebouncedQuery || isQueryTooShort ? (
                <SearchSuggestions
                    parentId={parentIdQuery}
                />
            ) : (
                <SearchResults
                    parentId={parentIdQuery}
                    collectionType={collectionTypeQuery}
                    query={debouncedQuery}
                />
            )}
        </Page>
    );
};

export default Search;
