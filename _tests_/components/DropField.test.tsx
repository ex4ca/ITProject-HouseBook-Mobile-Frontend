import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import DropField from "../../src/components/DropField";

describe("DropField", () => {
  it("opens and selects an item", () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <DropField options={["Option A", "Option B"]} selectedValue="Option A" onSelect={onSelect} />
    );

    fireEvent.press(getByText("Option A"));   
    fireEvent.press(getByText("Option B"));   
    expect(onSelect).toHaveBeenCalledWith("Option B");
  });
});
