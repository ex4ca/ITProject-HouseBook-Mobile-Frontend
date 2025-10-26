import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import JobBoard from "../../src/screens/tradie/JobBoard";
import { supabase } from "../../src/config/supabaseClient";

jest.mock("../../src/services/FetchAuthority", () => ({
  getJobsForTradie: jest.fn().mockResolvedValue([
    { job_id: "j1", property_id: "p1", name: "Fix Roof", address: "123 Street", splash_image: "" },
  ]),
}));

describe("JobBoard", () => {
  it("displays loaded jobs", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: "user-1" } } });
    const { getByText } = render(<JobBoard />);
    await waitFor(() => getByText("Fix Roof"));
    expect(getByText("Fix Roof")).toBeTruthy();
  });
});
