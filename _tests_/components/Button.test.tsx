import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Button from "../../src/components/Button";

describe("Button", () => {
  it("renders text and triggers onPress", () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button text="Tap me" onPress={onPress} />);
    fireEvent.press(getByText("Tap me"));
    expect(onPress).toHaveBeenCalled();
  });
});
