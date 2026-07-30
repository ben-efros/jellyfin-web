/**
 * Ambient module augmentation for @jellyfin/sdk's generated `ServerConfiguration` model.
 *
 * These fields were added on the Jellyfin server (see MediaBrowser.Model.Configuration.ServerConfiguration)
 * to support image resize/fill request clamping, cache-key quantization, and opt-in image request telemetry,
 * but have not yet been picked up by a regenerated/bumped `@jellyfin/sdk` release. Once the SDK is regenerated
 * from the updated OpenAPI spec and this package is bumped, this augmentation (and this file) should be removed.
 */
declare module '@jellyfin/sdk/lib/generated-client/models/server-configuration' {
    interface ServerConfiguration {
        /**
         * The maximum pixel dimension (width or height) that any client-requested image resize/fill operation
         * is allowed to specify. Requests exceeding this value are clamped server-side before any encoding work
         * begins, to protect the server from buggy or malicious clients requesting arbitrarily large images.
         */
        MaxImageDimension?: number | null;

        /**
         * The quantization step, in pixels, that fillWidth/fillHeight requests are rounded up to before being
         * used as part of the resized-image cache key, reducing the number of near-duplicate cache entries.
         */
        ImageFillSizeQuantizationStep?: number | null;

        /**
         * Whether telemetry for image resize/fill requests (image type, fillWidth, fillHeight, and whether the
         * request was served from cache or required a fresh encode) is being collected. Disabled by default;
         * toggling this from disabled to enabled always resets the collected data to a blank state.
         */
        EnableImageRequestTelemetry?: boolean | null;

        /**
         * One-shot flag: if set, the resized-image cache is cleared the next time image request telemetry
         * transitions from disabled to enabled. Automatically reset to false once consumed.
         */
        ClearImageCacheOnTelemetryEnable?: boolean | null;
    }
}

export {};
