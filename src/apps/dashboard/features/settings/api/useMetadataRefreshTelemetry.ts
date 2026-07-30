import type { Api } from '@jellyfin/sdk';
import { useQuery } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';

import { useApi } from 'hooks/useApi';
import type { MetadataRefreshTelemetryEntry } from 'types/metadataRefreshTelemetry';

export const QUERY_KEY = 'MetadataRefreshTelemetry';

export const fetchMetadataRefreshTelemetry = async (api: Api, options?: AxiosRequestConfig) => {
    const response = await api.axiosInstance.get<MetadataRefreshTelemetryEntry[]>(`${api.basePath}/Metadata/Telemetry`, options);

    return response.data;
};

export const useMetadataRefreshTelemetry = (enabled = true) => {
    const { api } = useApi();

    return useQuery({
        queryKey: [ QUERY_KEY ],
        queryFn: ({ signal }) => fetchMetadataRefreshTelemetry(api!, { signal }),
        enabled: !!api && enabled,
        refetchOnWindowFocus: false
    });
};
