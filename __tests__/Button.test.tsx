import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../src/components/Button';

describe('Button', () => {
  it('renders text and responds to press', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button text="Click me" onPress={onPress} />);

    const btn = getByText('Click me');
    expect(btn).toBeTruthy();

    fireEvent.press(btn);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
