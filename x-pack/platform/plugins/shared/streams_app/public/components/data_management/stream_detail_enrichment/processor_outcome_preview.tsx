/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useMemo } from 'react';
import {
  EuiFlexGroup,
  EuiFilterButton,
  EuiFilterGroup,
  EuiEmptyPrompt,
  EuiFlexItem,
  EuiSpacer,
  EuiProgress,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { isEmpty, isEqual } from 'lodash';
import { Sample } from '@kbn/grok-ui';
import { StreamsAppSearchBar } from '../../streams_app_search_bar';
import { PreviewTable } from '../preview_table';
import { AssetImage } from '../../asset_image';
import {
  useSimulatorSelector,
  useStreamEnrichmentEvents,
  useStreamsEnrichmentSelector,
} from './state_management/stream_enrichment_state_machine';
import {
  PreviewDocsFilterOption,
  getTableColumns,
  previewDocsFilterOptions,
} from './state_management/simulation_state_machine';
import { selectPreviewDocuments } from './state_management/simulation_state_machine/selectors';
import { isGrokProcessor } from './utils';
import { selectDraftProcessor } from './state_management/stream_enrichment_state_machine/selectors';

export const ProcessorOutcomePreview = () => {
  const isLoading = useSimulatorSelector(
    (state) =>
      state.matches('debouncingChanges') ||
      state.matches('loadingSamples') ||
      state.matches('runningSimulation')
  );

  return (
    <>
      <EuiFlexItem grow={false}>
        <OutcomeControls />
      </EuiFlexItem>
      <EuiSpacer size="m" />
      <OutcomePreviewTable />
      {isLoading && <EuiProgress size="xs" color="accent" position="absolute" />}
    </>
  );
};
const formatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 0,
});

const formatRateToPercentage = (rate?: number) =>
  (rate ? formatter.format(rate) : undefined) as any; // This is a workaround for the type error, since the numFilters & numActiveFilters props are defined as number | undefined

const OutcomeControls = () => {
  const { changePreviewDocsFilter } = useStreamEnrichmentEvents();

  const previewDocsFilter = useSimulatorSelector((state) => state.context.previewDocsFilter);
  const simulationFailedRate = useSimulatorSelector((state) =>
    formatRateToPercentage(state.context.simulation?.documents_metrics.failed_rate)
  );
  const simulationSkippedRate = useSimulatorSelector((state) =>
    formatRateToPercentage(state.context.simulation?.documents_metrics.skipped_rate)
  );
  const simulationPartiallyParsedRate = useSimulatorSelector((state) =>
    formatRateToPercentage(state.context.simulation?.documents_metrics.partially_parsed_rate)
  );
  const simulationParsedRate = useSimulatorSelector((state) =>
    formatRateToPercentage(state.context.simulation?.documents_metrics.parsed_rate)
  );

  const getFilterButtonPropsFor = (filter: PreviewDocsFilterOption) => ({
    isToggle: previewDocsFilter === filter,
    isSelected: previewDocsFilter === filter,
    hasActiveFilters: previewDocsFilter === filter,
    onClick: () => changePreviewDocsFilter(filter),
  });

  return (
    <EuiFlexGroup alignItems="center" justifyContent="spaceBetween" wrap>
      <EuiFilterGroup
        aria-label={i18n.translate(
          'xpack.streams.streamDetailView.managementTab.enrichment.processor.outcomeControlsAriaLabel',
          { defaultMessage: 'Filter for all, matching or unmatching previewed documents.' }
        )}
      >
        <EuiFilterButton
          {...getFilterButtonPropsFor(previewDocsFilterOptions.outcome_filter_all.id)}
        >
          {previewDocsFilterOptions.outcome_filter_all.label}
        </EuiFilterButton>
        <EuiFilterButton
          {...getFilterButtonPropsFor(previewDocsFilterOptions.outcome_filter_parsed.id)}
          badgeColor="success"
          numFilters={simulationParsedRate}
          numActiveFilters={simulationParsedRate}
        >
          {previewDocsFilterOptions.outcome_filter_parsed.label}
        </EuiFilterButton>
        <EuiFilterButton
          {...getFilterButtonPropsFor(previewDocsFilterOptions.outcome_filter_partially_parsed.id)}
          badgeColor="accent"
          numFilters={simulationPartiallyParsedRate}
          numActiveFilters={simulationPartiallyParsedRate}
        >
          {previewDocsFilterOptions.outcome_filter_partially_parsed.label}
        </EuiFilterButton>
        <EuiFilterButton
          {...getFilterButtonPropsFor(previewDocsFilterOptions.outcome_filter_skipped.id)}
          badgeColor="accent"
          numFilters={simulationSkippedRate}
          numActiveFilters={simulationSkippedRate}
        >
          {previewDocsFilterOptions.outcome_filter_skipped.label}
        </EuiFilterButton>
        <EuiFilterButton
          {...getFilterButtonPropsFor(previewDocsFilterOptions.outcome_filter_failed.id)}
          badgeColor="accent"
          numFilters={simulationFailedRate}
          numActiveFilters={simulationFailedRate}
        >
          {previewDocsFilterOptions.outcome_filter_failed.label}
        </EuiFilterButton>
      </EuiFilterGroup>
      <StreamsAppSearchBar showDatePicker />
    </EuiFlexGroup>
  );
};

const MemoPreviewTable = React.memo(PreviewTable, (prevProps, nextProps) => {
  // Need to specify the props to compare since the columns might be the same even if the useMemo call returns a new array
  return (
    prevProps.documents === nextProps.documents &&
    isEqual(prevProps.displayColumns, nextProps.displayColumns)
  );
});

const OutcomePreviewTable = () => {
  const processors = useSimulatorSelector((state) => state.context.processors);
  const detectedFields = useSimulatorSelector((state) => state.context.simulation?.detected_fields);
  const previewDocsFilter = useSimulatorSelector((state) => state.context.previewDocsFilter);
  const previewDocuments = useSimulatorSelector((snapshot) =>
    selectPreviewDocuments(snapshot.context)
  );

  const draftProcessor = useStreamsEnrichmentSelector((snapshot) =>
    selectDraftProcessor(snapshot.context)
  );

  const grokCollection = useStreamsEnrichmentSelector(
    (machineState) => machineState.context.grokCollection
  );

  const previewColumns = useMemo(
    () => getTableColumns(processors, detectedFields ?? [], previewDocsFilter),
    [detectedFields, previewDocsFilter, processors]
  );

  if (!previewDocuments || isEmpty(previewDocuments)) {
    return (
      <EuiEmptyPrompt
        titleSize="xs"
        icon={<AssetImage type="noResults" />}
        title={
          <h2>
            {i18n.translate(
              'xpack.streams.streamDetailView.managementTab.rootStreamEmptyPrompt.noDataTitle',
              { defaultMessage: 'Unable to generate a preview' }
            )}
          </h2>
        }
        body={
          <p>
            {i18n.translate(
              'xpack.streams.streamDetailView.managementTab.enrichment.processor.outcomePreviewTable.noDataBody',
              {
                defaultMessage:
                  "There are no sample documents to test the processors. Try updating the time range or ingesting more data, it might be possible we could not find any matching documents with the processors' source fields.",
              }
            )}
          </p>
        }
      />
    );
  }

  return draftProcessor?.processor &&
    isGrokProcessor(draftProcessor.processor) &&
    !isEmpty(draftProcessor.processor.grok.field) &&
    // NOTE: If a Grok expression attempts to overwrite the configured field (non-additive change) we defer to the standard preview table showing all columns
    !draftProcessor.resources?.grokExpressions.some((grokExpression) => {
      if (draftProcessor.processor && !isGrokProcessor(draftProcessor.processor)) return false;
      const fieldName = draftProcessor.processor?.grok.field;
      return Array.from(grokExpression.getFields().values()).some(
        (field) => field.name === fieldName
      );
    }) ? (
    <PreviewTable
      documents={previewDocuments}
      displayColumns={[draftProcessor.processor.grok.field]}
      rowHeightsOptions={{ defaultHeight: 'auto' }}
      renderCellValue={(document, columnId) => {
        const value = document[columnId];
        if (typeof value === 'string') {
          return (
            <Sample
              grokCollection={grokCollection}
              draftGrokExpressions={draftProcessor.resources?.grokExpressions ?? []}
              sample={value}
            />
          );
        } else {
          return undefined;
        }
      }}
    />
  ) : (
    <MemoPreviewTable documents={previewDocuments} displayColumns={previewColumns} />
  );
};
