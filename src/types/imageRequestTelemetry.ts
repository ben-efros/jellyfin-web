export type ImageType =
    | 'Primary'
    | 'Backdrop'
    | 'Thumb'
    | 'Banner'
    | 'Logo'
    | 'Art'
    | 'Disc'
    | 'Box'
    | 'Screenshot'
    | 'Menu'
    | 'Chapter'
    | 'BoxRear'
    | 'Profile';

export interface ImageRequestTelemetryEntry {
    ImageType: ImageType
    FillWidth: number | null
    FillHeight: number | null
    RequestCount: number
    CacheHitCount: number
    CacheMissCount: number
}
