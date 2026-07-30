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

import { useMetadataRefreshTelemetry } from 'apps/dashboard/features/settings/api/useMetadataRefreshTelemetry';
import globalize from 'lib/globalize';

import type { MetadataRefreshTelemetryEntry } from 'types/metadataRefreshTelemetry';

type MetadataRefreshTelemetryPanelProps = {
    enabled: boolean
};

const EMPTY_VALUE = '—';

const formatMs = (value: number) => `${Math.round(value).toLocaleString()} ms`;

const formatNotFoundRate = (entry: MetadataRefreshTelemetryEntry) => {
    if (entry.RequestCount <= 0) {
        return EMPTY_VALUE;
    }

    return `${((entry.NotFoundCount / entry.RequestCount) * 100).toFixed(1)}%`;
};

const MetadataRefreshTelemetryPanel: FC<MetadataRefreshTelemetryPanelProps> = ({ enabled }) => {
    const {
        data,
        isPending,
        isFetching,
        isError,
        refetch
    } = useMetadataRefreshTelemetry(enabled);

    // Sort by total time spent (not just request count) so the providers/item types actually dragging
    // out library scans and metadata refreshes surface at the top, rather than just the most-invoked ones.
    const rows = useMemo(() => (
        [ ...(data || []) ].sort((left, right) => right.TotalDurationMs - left.TotalDurationMs)
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
                    {globalize.translate('HeaderMetadataRefreshTelemetry')}
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
                        {globalize.translate('LabelMetadataRefreshTelemetryRefresh')}
                    </Button>
                )}
            </Stack>

            {!enabled ? (
                <Alert severity='info'>
                    {globalize.translate('LabelMetadataRefreshTelemetryDisabledHelp')}
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
                    {globalize.translate('LabelMetadataRefreshTelemetryEmpty')}
                </Alert>
            ) : (
                <TableContainer component={Paper} variant='outlined'>
                    <Table size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell>{globalize.translate('LabelMetadataRefreshTelemetryColumnItemType')}</TableCell>
                                <TableCell>{globalize.translate('LabelMetadataRefreshTelemetryColumnProvider')}</TableCell>
                                <TableCell>{globalize.translate('LabelMetadataRefreshTelemetryColumnProviderType')}</TableCell>
                                <TableCell>{globalize.translate('LabelMetadataRefreshTelemetryColumnRequests')}</TableCell>
                                <TableCell>{globalize.translate('LabelMetadataRefreshTelemetryColumnFound')}</TableCell>
                                <TableCell>{globalize.translate('LabelMetadataRefreshTelemetryColumnNotFoundRate')}</TableCell>
                                <TableCell>{globalize.translate('LabelMetadataRefreshTelemetryColumnErrors')}</TableCell>
                                <TableCell>{globalize.translate('LabelMetadataRefreshTelemetryColumnAvgDuration')}</TableCell>
                                <TableCell>{globalize.translate('LabelMetadataRefreshTelemetryColumnMaxDuration')}</TableCell>
                                <TableCell>{globalize.translate('LabelMetadataRefreshTelemetryColumnTotalDuration')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row) => (
                                <TableRow
                                    key={`${row.ItemType}-${row.ProviderName}-${row.ProviderType}`}
                                >
                                    <TableCell>{row.ItemType}</TableCell>
                                    <TableCell>{row.ProviderName}</TableCell>
                                    <TableCell>{row.ProviderType}</TableCell>
                                    <TableCell>{row.RequestCount}</TableCell>
                                    <TableCell>{row.FoundCount}</TableCell>
                                    <TableCell>{formatNotFoundRate(row)}</TableCell>
                                    <TableCell>{row.ErrorCount}</TableCell>
                                    <TableCell>{formatMs(row.AverageDurationMs)}</TableCell>
                                    <TableCell>{formatMs(row.MaxDurationMs)}</TableCell>
                                    <TableCell>{formatMs(row.TotalDurationMs)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Stack>
    );
};

export default MetadataRefreshTelemetryPanel;
