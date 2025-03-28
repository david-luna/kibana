/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { KibanaRequest, KibanaResponseFactory } from '@kbn/core/server';
import { identity } from 'lodash';
import type { MethodKeysOf } from '@kbn/utility-types';
import { httpServerMock } from '@kbn/core/server/mocks';
import type { ActionsRequestHandlerContext } from '../types';
import { actionsClientMock } from '../mocks';
import type { ActionsClientMock } from '../actions_client/actions_client.mock';
import type { ConnectorType } from '../application/connector/types';

export function mockHandlerArguments(
  {
    actionsClient = actionsClientMock.create(),
    listTypes: listTypesRes = [],
  }: { actionsClient?: ActionsClientMock; listTypes?: ConnectorType[] },
  request: unknown,
  response?: Array<MethodKeysOf<KibanaResponseFactory>>
): [ActionsRequestHandlerContext, KibanaRequest<unknown, unknown, unknown>, KibanaResponseFactory] {
  const listTypes = jest.fn(() => listTypesRes);
  return [
    {
      actions: {
        listTypes,
        getActionsClient() {
          return (
            actionsClient || {
              get: jest.fn(),
              delete: jest.fn(),
              update: jest.fn(),
              find: jest.fn(),
              create: jest.fn(),
            }
          );
        },
      },
    } as unknown as ActionsRequestHandlerContext,
    request as KibanaRequest<unknown, unknown, unknown>,
    mockResponseFactory(response),
  ];
}

export const mockResponseFactory = (resToMock: Array<MethodKeysOf<KibanaResponseFactory>> = []) => {
  const factory: jest.Mocked<KibanaResponseFactory> = httpServerMock.createResponseFactory();
  resToMock.forEach((key: string) => {
    if (key in factory) {
      Object.defineProperty(factory, key, {
        value: jest.fn(identity),
      });
    }
  });
  return factory as unknown as KibanaResponseFactory;
};
