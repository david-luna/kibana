/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { act, waitFor, renderHook } from '@testing-library/react';

import { usePersistConfiguration } from './use_persist_configuration';
import * as api from './api';
import { useToasts } from '../../common/lib/kibana';

import { ConnectorTypes } from '../../../common';
import { casesQueriesKeys } from '../constants';
import {
  customFieldsConfigurationMock,
  observableTypesMock,
  templatesConfigurationMock,
} from '../mock';
import { TestProviders, createTestQueryClient } from '../../common/mock';
import React from 'react';

jest.mock('./api');
jest.mock('../../common/lib/kibana');

const useToastMock = useToasts as jest.Mock;

describe('usePersistConfiguration', () => {
  const addError = jest.fn();
  const addSuccess = jest.fn();

  useToastMock.mockReturnValue({
    addError,
    addSuccess,
  });

  const request = {
    closureType: 'close-by-user' as const,
    connector: {
      fields: null,
      id: 'none',
      name: 'none',
      type: ConnectorTypes.none,
    },
    customFields: [],
    templates: [],
    version: '',
    id: '',
    observableTypes: observableTypesMock,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls postCaseConfigure when the id is empty', async () => {
    const spyPost = jest.spyOn(api, 'postCaseConfigure');
    const spyPatch = jest.spyOn(api, 'patchCaseConfigure');

    const { result } = renderHook(() => usePersistConfiguration(), {
      wrapper: TestProviders,
    });

    act(() => {
      result.current.mutate({ ...request, version: 'test' });
    });

    await waitFor(() => {
      expect(spyPost).toHaveBeenCalledWith({
        closure_type: 'close-by-user',
        connector: { fields: null, id: 'none', name: 'none', type: '.none' },
        customFields: [],
        owner: 'securitySolution',
        templates: [],
        observableTypes: observableTypesMock,
      });
    });

    expect(spyPatch).not.toHaveBeenCalled();
  });

  it('calls postCaseConfigure when the version is empty', async () => {
    const spyPost = jest.spyOn(api, 'postCaseConfigure');
    const spyPatch = jest.spyOn(api, 'patchCaseConfigure');

    const { result } = renderHook(() => usePersistConfiguration(), {
      wrapper: TestProviders,
    });

    act(() => {
      result.current.mutate({ ...request, id: 'test' });
    });

    await waitFor(() => {
      expect(spyPost).toHaveBeenCalledWith({
        closure_type: 'close-by-user',
        connector: { fields: null, id: 'none', name: 'none', type: '.none' },
        customFields: [],
        templates: [],
        owner: 'securitySolution',
        observableTypes: observableTypesMock,
      });
    });

    expect(spyPatch).not.toHaveBeenCalled();
  });

  it('calls postCaseConfigure with correct data', async () => {
    const spyPost = jest.spyOn(api, 'postCaseConfigure');

    const { result } = renderHook(() => usePersistConfiguration(), {
      wrapper: TestProviders,
    });

    const newRequest = {
      ...request,
      customFields: customFieldsConfigurationMock,
      templates: templatesConfigurationMock,
    };

    act(() => {
      result.current.mutate({ ...newRequest, id: 'test-id' });
    });

    await waitFor(() => {
      expect(spyPost).toHaveBeenCalledWith({
        closure_type: 'close-by-user',
        connector: { fields: null, id: 'none', name: 'none', type: '.none' },
        customFields: customFieldsConfigurationMock,
        templates: templatesConfigurationMock,
        owner: 'securitySolution',
        observableTypes: observableTypesMock,
      });
    });
  });

  it('calls patchCaseConfigure when the id and the version are not empty', async () => {
    const spyPost = jest.spyOn(api, 'postCaseConfigure');
    const spyPatch = jest.spyOn(api, 'patchCaseConfigure');

    const { result } = renderHook(() => usePersistConfiguration(), {
      wrapper: TestProviders,
    });

    act(() => {
      result.current.mutate({ ...request, id: 'test-id', version: 'test-version' });
    });

    await waitFor(() => {
      expect(spyPatch).toHaveBeenCalledWith('test-id', {
        closure_type: 'close-by-user',
        connector: { fields: null, id: 'none', name: 'none', type: '.none' },
        customFields: [],
        templates: [],
        version: 'test-version',
        observableTypes: observableTypesMock,
      });
    });

    expect(spyPost).not.toHaveBeenCalled();
  });

  it('calls patchCaseConfigure with correct data', async () => {
    const spyPatch = jest.spyOn(api, 'patchCaseConfigure');

    const { result } = renderHook(() => usePersistConfiguration(), {
      wrapper: TestProviders,
    });

    const newRequest = {
      ...request,
      customFields: customFieldsConfigurationMock,
      templates: templatesConfigurationMock,
    };

    act(() => {
      result.current.mutate({ ...newRequest, id: 'test-id', version: 'test-version' });
    });

    await waitFor(() => {
      expect(spyPatch).toHaveBeenCalledWith('test-id', {
        closure_type: 'close-by-user',
        connector: { fields: null, id: 'none', name: 'none', type: '.none' },
        customFields: customFieldsConfigurationMock,
        templates: templatesConfigurationMock,
        version: 'test-version',
        observableTypes: observableTypesMock,
      });
    });
  });

  it('calls patchCaseConfigure without observableTypes if it is not specified', async () => {
    const spyPatch = jest.spyOn(api, 'patchCaseConfigure');

    const { result } = renderHook(() => usePersistConfiguration(), {
      wrapper: TestProviders,
    });

    const { observableTypes, ...rest } = request;

    const newRequest = {
      ...rest,
      customFields: customFieldsConfigurationMock,
      templates: templatesConfigurationMock,
    };

    act(() => {
      result.current.mutate({ ...newRequest, id: 'test-id', version: 'test-version' });
    });

    await waitFor(() => {
      expect(spyPatch).toHaveBeenCalledWith('test-id', {
        closure_type: 'close-by-user',
        connector: { fields: null, id: 'none', name: 'none', type: '.none' },
        customFields: customFieldsConfigurationMock,
        templates: templatesConfigurationMock,
        version: 'test-version',
      });
    });
  });

  it('invalidates the queries correctly', async () => {
    const queryClient = createTestQueryClient();
    const queryClientSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => usePersistConfiguration(), {
      wrapper: (props) => <TestProviders {...props} queryClient={queryClient} />,
    });

    act(() => {
      result.current.mutate(request);
    });

    await waitFor(() => {
      expect(queryClientSpy).toHaveBeenCalledWith(casesQueriesKeys.configuration({}));
    });
  });

  it('shows the success toaster', async () => {
    const { result } = renderHook(() => usePersistConfiguration(), {
      wrapper: TestProviders,
    });

    act(() => {
      result.current.mutate(request);
    });

    await waitFor(() => {
      expect(addSuccess).toHaveBeenCalled();
    });
  });

  it('shows a toast error when the api return an error', async () => {
    jest
      .spyOn(api, 'postCaseConfigure')
      .mockRejectedValue(new Error('useCreateAttachments: Test error'));

    const { result } = renderHook(() => usePersistConfiguration(), {
      wrapper: TestProviders,
    });

    act(() => {
      result.current.mutate(request);
    });

    await waitFor(() => {
      expect(addError).toHaveBeenCalled();
    });
  });
});
