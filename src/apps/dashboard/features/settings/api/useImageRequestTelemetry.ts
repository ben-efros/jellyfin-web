import type { Api } from '@jellyfin/sdk';
import { useQuery } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';

import { useApi } from 'hooks/useApi';
import type { ImageRequestTelemetryEntry } from 'types/imageRequestTelemetry';

export const QUERY_KEY = 'ImageRequestTelemetry';

export const fetchImageRequestTelemetry = async (api: Api, options?: AxiosRequestConfig) => {
    const response = await api.axiosInstance.get<ImageRequestTelemetryEntry[]>(`${api.basePath}/Images/Telemetry`, options);

    return response.data;
};

export const useImageRequestTelemetry = (enabled = true) => {
    const { api } = useApi();

    return useQuery({
        queryKey: [ QUERY_KEY ],
        queryFn: ({ signal }) => fetchImageRequestTelemetry(api!, { signal }),
        enabled: !!api && enabled,
        refetchOnWindowFocus: false
    });
};
