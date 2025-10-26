import React from "react";
import { render } from "@testing-library/react-native";
import AppNavigator from "../../src/navigation/AppNavigator";

describe("AppNavigator", () => {
  it("renders without crashing for owner role", () => {
    const { toJSON } = render(<AppNavigator userRole="owner" />);
    expect(toJSON()).toBeTruthy();
  });
});
