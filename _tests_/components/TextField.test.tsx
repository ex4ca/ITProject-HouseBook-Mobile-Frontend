import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import TextField from "../../src/components/TextField";

describe("TextField", () => {
  it("calls onChangeText when text updates", () => {
    const onChange = jest.fn();
    const { getByPlaceholderText } = render(
      <TextField placeholder="Type here" value="" onChangeText={onChange} />
    );

    fireEvent.changeText(getByPlaceholderText("Type here"), "Hello");
    expect(onChange).toHaveBeenCalledWith("Hello");
  });
});
