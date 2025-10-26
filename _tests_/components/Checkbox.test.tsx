import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Checkbox from "../../src/components/Checkbox";

describe("Checkbox", () => {
  it("calls onPress when pressed", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Checkbox checked={false} onPress={onPress} label="Agree to terms" />
    );

    fireEvent.press(getByText("Agree to terms"));

    expect(onPress).toHaveBeenCalled();
  });
});
