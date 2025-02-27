/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React from 'react';
import { shallowWithI18nProvider, mountWithI18nProvider } from '@kbn/test-jest-helpers';

import { ColorFormatEditor } from './color';
import { FieldFormat, DEFAULT_CONVERTER_COLOR } from '@kbn/field-formats-plugin/common';

const fieldType = 'string';
const format = {
  getConverterFor: jest.fn(),
};
const formatParams = {
  colors: [{ ...DEFAULT_CONVERTER_COLOR }],
};
const onChange = jest.fn();
const onError = jest.fn();

describe('ColorFormatEditor', () => {
  it('should have a formatId', () => {
    expect(ColorFormatEditor.formatId).toEqual('color');
  });

  it('renders the color swatch icon inside the button', () => {
    const component = mountWithI18nProvider(
      <ColorFormatEditor
        fieldType={'color'}
        format={format as unknown as FieldFormat}
        formatParams={formatParams}
        onChange={onChange}
        onError={onError}
      />
    );

    const button = component.find('[data-test-subj="buttonColorSwatchIcon"]').at(0);
    expect(button.exists()).toBe(true);
  });

  it('should render string type normally (regex field)', async () => {
    const component = shallowWithI18nProvider(
      <ColorFormatEditor
        fieldType={fieldType}
        format={format as unknown as FieldFormat}
        formatParams={formatParams}
        onChange={onChange}
        onError={onError}
      />
    );

    expect(component).toMatchSnapshot();
  });

  it('should render boolean type normally', async () => {
    const component = shallowWithI18nProvider(
      <ColorFormatEditor
        fieldType={'boolean'}
        format={format as unknown as FieldFormat}
        formatParams={formatParams}
        onChange={onChange}
        onError={onError}
      />
    );

    expect(component).toMatchSnapshot();
  });

  it('should render other type normally (range field)', async () => {
    const component = shallowWithI18nProvider(
      <ColorFormatEditor
        fieldType={'number'}
        format={format as unknown as FieldFormat}
        formatParams={formatParams}
        onChange={onChange}
        onError={onError}
      />
    );

    expect(component).toMatchSnapshot();
  });

  it('should render multiple colors', async () => {
    const component = shallowWithI18nProvider(
      <ColorFormatEditor
        fieldType={fieldType}
        format={format as unknown as FieldFormat}
        formatParams={{ colors: [...formatParams.colors, ...formatParams.colors] }}
        onChange={onChange}
        onError={onError}
      />
    );

    expect(component).toMatchSnapshot();
  });
});
