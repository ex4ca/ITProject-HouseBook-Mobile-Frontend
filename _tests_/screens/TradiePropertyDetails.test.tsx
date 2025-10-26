import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import TradiePropertyDetails from "../../src/screens/tradie/TradiePropertyDetails";
import { useRoute } from "@react-navigation/native";

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({ goBack: jest.fn() }),
  useRoute: jest.fn(),
}));

jest.mock("../../src/services/FetchAuthority", () => ({
  fetchPropertyAndJobScope: jest.fn().mockResolvedValue({
    property: {
      Spaces: [
        {
          id: "s1",
          name: "Kitchen",
          Assets: [
            {
              id: "a1",
              description: "Sink",
              ChangeLog: [
                {
                  status: "ACCEPTED",
                  specifications: { brand: "ABC" },
                  created_at: new Date().toISOString(),
                  User: { first_name: "Test", last_name: "User" }
                }
              ]
            }
          ]
        }
      ],
    },
    editableAssetIds: new Set(["a1"]),
  }),
}));

jest.mock("../../src/services/FetchAssetTypes", () => ({
  fetchAssetTypes: jest.fn().mockResolvedValue([{ id: 1, name: "Sink", discipline: "Plumbing" }]),
}));

describe("TradiePropertyDetails", () => {
  it("renders property and asset info", async () => {
    (useRoute as jest.Mock).mockReturnValue({ params: { propertyId: "p1", jobId: "j1" }});
    const { getByText } = render(<TradiePropertyDetails />);
    await waitFor(() => getByText("Kitchen"));
    expect(getByText("Sink")).toBeTruthy();
  });
});
