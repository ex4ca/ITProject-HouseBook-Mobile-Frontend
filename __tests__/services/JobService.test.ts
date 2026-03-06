import { claimJobWithPin } from "../../src/services/JobService";
import { supabase } from "../../src/config/supabaseClient";

// Mock the Supabase client
jest.mock("../../src/config/supabaseClient", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(),
      insert: jest.fn(),
    })),
  },
}));

describe("JobService - claimJobWithPin", () => {
  const MOCK_PROPERTY_ID = "test-property-id";
  const MOCK_PIN = "123456";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return an error message if there are no active jobs", async () => {
    // 1. Mock the user being logged in
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: "test-user-id" } },
    });

    // We need to mock the sequential chained calls to `supabase.from()`
    // Call 1: Identify Tradie Profile (Success)
    // Call 2: Verify Property ID (Success)
    // Call 3: Find Matching Active Job (Fail - Emulating an empty Jobs table)

    const fromMock = supabase.from as jest.Mock;

    fromMock.mockImplementation((tableName) => {
      if (tableName === "Tradesperson") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { tradie_id: "test-tradie-id" },
            error: null,
          }),
        };
      }
      if (tableName === "Property") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { property_id: MOCK_PROPERTY_ID },
            error: null,
          }),
        };
      }
      if (tableName === "Jobs") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          gt: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            // Returning an error here simulates exactly what happens when 0 jobs exist
            error: { message: "JSON object requested, multiple (or no) rows returned" }, 
          }),
        };
      }
    });

    const result = await claimJobWithPin(MOCK_PROPERTY_ID, MOCK_PIN);

    expect(result.success).toBe(false);
    expect(result.message).toBe("Invalid PIN or this job has expired.");
  });
});
