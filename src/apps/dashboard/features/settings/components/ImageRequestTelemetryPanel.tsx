import RefreshIcon from '@mui/icons-material/Refresh';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import React, { type FC, useMemo } from 'react';

import { useImageRequestTelemetry } from 'apps/dashboard/features/settings/api/useImageRequestTelemetry';
import globalize from 'lib/globalize';

import type { ImageRequestTelemetryEntry } from 'types/imageRequestTelemetry';

type ImageRequestTelemetryPanelProps = {
    enabled: boolean
};

const EMPTY_VALUE = '—';

const formatNullableNumber = (value: number | null) => value ?? EMPTY_VALUE;

const formatHitRate = (entry: ImageRequestTelemetryEntry) => {
    if (entry.RequestCount <= 0) {
        return EMPTY_VALUE;
    }

    return `${((entry.CacheHitCount / entry.RequestCount) * 100).toFixed(1)}%`;
};

const ImageRequestTelemetryPanel: FC<ImageRequestTelemetryPanelProps> = ({ enabled }) => {
    const {
        data,
        isPending,
        isFetching,
        isError,
        refetch
    } = useImageRequestTelemetry(enabled);

    const rows = useMemo(() => (
        [ ...(data || []) ].sort((left, right) => right.RequestCount - left.RequestCount)
    ), [ data ]);

    return (
        <Stack spacing={2}>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                justifyContent='space-between'
                alignItems={{ xs: 'flex-start', sm: 'center' }}
            >
                <Typography variant='h3'>
                    {globalize.translate('HeaderImageRequestTelemetry')}
                </Typography>

                {enabled && (
                    <Button
                        type='button'
                        startIcon={<RefreshIcon />}
                        onClick={() => {
                            void refetch();
                        }}
                        loading={isFetching}
                        loadingPosition='start'
                    >
                        {globalize.translate('LabelImageRequestTelemetryRefresh')}
                    </Button>
                )}
            </Stack>

            {!enabled ? (
                <Alert severity='info'>
                    {globalize.translate('LabelImageRequestTelemetryDisabledHelp')}
                </Alert>
            ) : isPending ? (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        py: 3
                    }}
                >
                    <CircularProgress />
                </Box>
            ) : isError ? (
                <Alert severity='error'>
                    {globalize.translate('ErrorDefault')}
                </Alert>
            ) : rows.length === 0 ? (
                <Alert severity='info'>
                    {globalize.translate('LabelImageRequestTelemetryEmpty')}
                </Alert>
            ) : (
                <TableContainer component={Paper} variant='outlined'>
                    <Table size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell>{globalize.translate('LabelImageRequestTelemetryColumnImageType')}</TableCell>
                                <TableCell>{globalize.translate('LabelImageRequestTelemetryColumnFillWidth')}</TableCell>
                                <TableCell>{globalize.translate('LabelImageRequestTelemetryColumnFillHeight')}</TableCell>
                                <TableCell>{globalize.translate('LabelImageRequestTelemetryColumnRequests')}</TableCell>
                                <TableCell>{globalize.translate('LabelImageRequestTelemetryColumnCacheHits')}</TableCell>
                                <TableCell>{globalize.translate('LabelImageRequestTelemetryColumnCacheMisses')}</TableCell>
                                <TableCell>{globalize.translate('LabelImageRequestTelemetryColumnHitRate')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row) => (
                                <TableRow
                                    key={`${row.ImageType}-${row.FillWidth ?? 'null'}-${row.FillHeight ?? 'null'}`}
                                >
                                    <TableCell>{row.ImageType}</TableCell>
                                    <TableCell>{formatNullableNumber(row.FillWidth)}</TableCell>
                                    <TableCell>{formatNullableNumber(row.FillHeight)}</TableCell>
                                    <TableCell>{row.RequestCount}</TableCell>
                                    <TableCell>{row.CacheHitCount}</TableCell>
                                    <TableCell>{row.CacheMissCount}</TableCell>
                                    <TableCell>{formatHitRate(row)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Stack>
    );
};

export default ImageRequestTelemetryPanel;
