import React from 'react';
import { render } from '@testing-library/react-native';
import SpecificationDetails from '../src/components/SpecificationDetails';

describe('SpecificationDetails', () => {
  it('renders keys and values', () => {
    const specs = { colour: 'red', width: 42, available: true };
    const { getByText } = render(<SpecificationDetails specifications={specs} />);

    expect(getByText('colour')).toBeTruthy();
    expect(getByText('red')).toBeTruthy();
    expect(getByText('width')).toBeTruthy();
    expect(getByText('42')).toBeTruthy();
    expect(getByText('available')).toBeTruthy();
    expect(getByText('true')).toBeTruthy();
  });
});
