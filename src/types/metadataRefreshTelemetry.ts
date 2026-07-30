export interface MetadataRefreshTelemetryEntry {
    ItemType: string
    ProviderName: string
    ProviderType: 'Local' | 'Remote'
    RequestCount: number
    FoundCount: number
    NotFoundCount: number
    ErrorCount: number
    TotalDurationMs: number
    MinDurationMs: number
    MaxDurationMs: number
    AverageDurationMs: number
}
