import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ConfirmModal from '../src/components/ConfirmModal';

describe('ConfirmModal', () => {
  it('renders title and message and calls callbacks', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    const { getByText } = render(
      <ConfirmModal
        visible={true}
        title="Delete Item"
        message="Are you sure?"
        confirmText="Delete"
        cancelText="No"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(getByText('Delete Item')).toBeTruthy();
    expect(getByText('Are you sure?')).toBeTruthy();

    const cancel = getByText('No');
    fireEvent.press(cancel);
    expect(onCancel).toHaveBeenCalledTimes(1);

    const confirm = getByText('Delete');
    fireEvent.press(confirm);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
