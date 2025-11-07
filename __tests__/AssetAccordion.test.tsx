import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AssetAccordion from '../src/components/AssetAccordion';

const mockAsset = {
  id: 'asset1',
  description: 'Aircon',
  asset_type_id: 1,
  ChangeLog: [
    { id: 'log1', status: 'ACCEPTED', specifications: { model: 'X100' }, created_at: new Date().toISOString() }
  ]
};

describe('AssetAccordion', () => {
  it('shows current specs and calls onAddHistory when Add Entry pressed', () => {
    const onAddHistory = jest.fn();
    const onToggle = jest.fn();

    const { getByText } = render(
      <AssetAccordion asset={mockAsset as any} isExpanded={true} onToggle={onToggle} onAddHistory={onAddHistory} />
    );

    expect(getByText('Current Specifications')).toBeTruthy();
    expect(getByText('model')).toBeTruthy();
    expect(getByText('X100')).toBeTruthy();

    const addBtn = getByText('Add Entry');
    fireEvent.press(addBtn);
    expect(onAddHistory).toHaveBeenCalledTimes(1);
    expect(onAddHistory).toHaveBeenCalledWith(mockAsset);
  });
});
