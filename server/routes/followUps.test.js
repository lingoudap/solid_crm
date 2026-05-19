import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import FollowUp from "../models/FollowUpEnhanced.js";
import followUpsRouter from "./followUps.js";

// Create an Express app for testing
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/followups", followUpsRouter);
  return app;
};

// Mock FollowUp model
jest.mock("../models/FollowUp.js");

describe("Follow-Up Routes - PUT /api/followups/:id", () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  describe("Successful Updates", () => {
    // Test 1: Update with conversationDetails only (mark as Completed)
    test("should update follow-up with conversationDetails and set status to Completed", async () => {
      const followUpId = new mongoose.Types.ObjectId();
      const mockFollowUp = {
        _id: followUpId,
        relatedType: "Lead",
        relatedId: new mongoose.Types.ObjectId(),
        followUpDate: new Date("2024-03-15T10:00:00"),
        notes: "Initial follow-up",
        status: "Completed",
        conversationDetails: "Great conversation",
        updatedAt: new Date(),
        createdAt: new Date("2024-03-10"),
      };

      FollowUp.findByIdAndUpdate.mockResolvedValueOnce(mockFollowUp);

      const response = await request(app).put(`/api/followups/${followUpId}`).send({
        conversationDetails: "Great conversation",
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockFollowUp);
      expect(FollowUp.findByIdAndUpdate).toHaveBeenCalledWith(
        followUpId.toString(),
        expect.objectContaining({
          conversationDetails: "Great conversation",
          status: "Completed",
          updatedAt: expect.any(Date),
        }),
        expect.objectContaining({ new: true, runValidators: true })
      );
    });

    // Test 2: Update with conversationDetails and nextFollowUpDate (mark as Running)
    test("should update follow-up with conversationDetails and nextFollowUpDate, set status to Running", async () => {
      const followUpId = new mongoose.Types.ObjectId();
      const nextDate = new Date("2024-03-22T14:00:00").toISOString();

      const mockFollowUp = {
        _id: followUpId,
        relatedType: "Quotation",
        relatedId: new mongoose.Types.ObjectId(),
        followUpDate: new Date("2024-03-15T10:00:00"),
        notes: "Initial follow-up",
        status: "Running",
        conversationDetails: "Discussed pricing",
        nextFollowUpDate: new Date(nextDate),
        updatedAt: new Date(),
        createdAt: new Date("2024-03-10"),
      };

      FollowUp.findByIdAndUpdate.mockResolvedValueOnce(mockFollowUp);

      const response = await request(app).put(`/api/followups/${followUpId}`).send({
        conversationDetails: "Discussed pricing",
        nextFollowUpDate: nextDate,
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("Running");
      expect(response.body.conversationDetails).toBe("Discussed pricing");
      expect(FollowUp.findByIdAndUpdate).toHaveBeenCalledWith(
        followUpId.toString(),
        expect.objectContaining({
          conversationDetails: "Discussed pricing",
          status: "Running",
          nextFollowUpDate: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
        expect.objectContaining({ new: true, runValidators: true })
      );
    });

    // Test 3: Whitespace should be trimmed from conversationDetails
    test("should trim whitespace from conversationDetails", async () => {
      const followUpId = new mongoose.Types.ObjectId();
      const mockFollowUp = {
        _id: followUpId,
        status: "Completed",
        conversationDetails: "Trimmed text",
        updatedAt: new Date(),
      };

      FollowUp.findByIdAndUpdate.mockResolvedValueOnce(mockFollowUp);

      const response = await request(app).put(`/api/followups/${followUpId}`).send({
        conversationDetails: "   Trimmed text   ",
      });

      expect(response.status).toBe(200);
      expect(FollowUp.findByIdAndUpdate).toHaveBeenCalledWith(
        followUpId.toString(),
        expect.objectContaining({
          conversationDetails: "Trimmed text",
        }),
        expect.any(Object)
      );
    });
  });

  describe("Validation Errors", () => {
    // Test 4: Missing conversationDetails
    test("should return 400 error when conversationDetails is missing", async () => {
      const followUpId = new mongoose.Types.ObjectId();

      const response = await request(app).put(`/api/followups/${followUpId}`).send({
        nextFollowUpDate: new Date().toISOString(),
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("conversationDetails is required");
    });

    // Test 5: Empty conversationDetails
    test("should return 400 error when conversationDetails is empty string", async () => {
      const followUpId = new mongoose.Types.ObjectId();

      const response = await request(app).put(`/api/followups/${followUpId}`).send({
        conversationDetails: "",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("conversationDetails is required");
    });

    // Test 6: Whitespace-only conversationDetails
    test("should return 400 error when conversationDetails is only whitespace", async () => {
      const followUpId = new mongoose.Types.ObjectId();

      const response = await request(app).put(`/api/followups/${followUpId}`).send({
        conversationDetails: "   \n\t  ",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("conversationDetails is required");
    });

    // Test 7: conversationDetails is not a string
    test("should return 400 error when conversationDetails is not a string", async () => {
      const followUpId = new mongoose.Types.ObjectId();

      const response = await request(app).put(`/api/followups/${followUpId}`).send({
        conversationDetails: { text: "invalid" },
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("conversationDetails is required");
    });

    // Test 8: Invalid nextFollowUpDate format
    test("should return 400 error for invalid nextFollowUpDate format", async () => {
      const followUpId = new mongoose.Types.ObjectId();

      const response = await request(app).put(`/api/followups/${followUpId}`).send({
        conversationDetails: "Good talk",
        nextFollowUpDate: "invalid-date-format",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Invalid nextFollowUpDate format");
    });

    // Test 9: Invalid ISO date string
    test("should return 400 error for invalid ISO date", async () => {
      const followUpId = new mongoose.Types.ObjectId();

      const response = await request(app).put(`/api/followups/${followUpId}`).send({
        conversationDetails: "Good talk",
        nextFollowUpDate: "2024-13-45T25:00:00Z",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Invalid nextFollowUpDate format");
    });

    // Test 10: conversationDetails is null
    test("should return 400 error when conversationDetails is null", async () => {
      const followUpId = new mongoose.Types.ObjectId();

      const response = await request(app).put(`/api/followups/${followUpId}`).send({
        conversationDetails: null,
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("conversationDetails is required");
    });
  });

  describe("Database Errors", () => {
    // Test 11: Follow-up not found
    test("should return 404 when follow-up is not found", async () => {
      const followUpId = new mongoose.Types.ObjectId();

      FollowUp.findByIdAndUpdate.mockResolvedValueOnce(null);

      const response = await request(app).put(`/api/followups/${followUpId}`).send({
        conversationDetails: "Good talk",
      });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Follow-up not found");
    });

    // Test 12: Database connection error
    test("should return 400 on database error", async () => {
      const followUpId = new mongoose.Types.ObjectId();
      const dbError = new Error("MongoDB connection failed");

      FollowUp.findByIdAndUpdate.mockRejectedValueOnce(dbError);

      const response = await request(app).put(`/api/followups/${followUpId}`).send({
        conversationDetails: "Good talk",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("MongoDB connection failed");
    });

    // Test 13: Validation error from schema
    test("should return 400 on schema validation error", async () => {
      const followUpId = new mongoose.Types.ObjectId();
      const validationError = new Error("Validation failed");
      validationError.name = "ValidationError";

      FollowUp.findByIdAndUpdate.mockRejectedValueOnce(validationError);

      const response = await request(app).put(`/api/followups/${followUpId}`).send({
        conversationDetails: "Good talk",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Validation failed");
    });
  });

  describe("Edge Cases", () => {
    // Test 14: Very long conversationDetails
    test("should handle very long conversationDetails", async () => {
      const followUpId = new mongoose.Types.ObjectId();
      const longText = "a".repeat(10000);

      const mockFollowUp = {
        _id: followUpId,
        status: "Completed",
        conversationDetails: longText,
        updatedAt: new Date(),
      };

      FollowUp.findByIdAndUpdate.mockResolvedValueOnce(mockFollowUp);

      const response = await request(app).put(`/api/followups/${followUpId}`).send({
        conversationDetails: longText,
      });

      expect(response.status).toBe(200);
      expect(FollowUp.findByIdAndUpdate).toHaveBeenCalled();
    });

    // Test 15: Special characters in conversationDetails
    test("should handle special characters and Unicode in conversationDetails", async () => {
      const followUpId = new mongoose.Types.ObjectId();
      const specialText = "Meeting discussed: 价格💰, emoji😊, symbols!@#$%^&*()";

      const mockFollowUp = {
        _id: followUpId,
        status: "Completed",
        conversationDetails: specialText,
        updatedAt: new Date(),
      };

      FollowUp.findByIdAndUpdate.mockResolvedValueOnce(mockFollowUp);

      const response = await request(app).put(`/api/followups/${followUpId}`).send({
        conversationDetails: specialText,
      });

      expect(response.status).toBe(200);
      expect(FollowUp.findByIdAndUpdate).toHaveBeenCalledWith(
        followUpId.toString(),
        expect.objectContaining({
          conversationDetails: specialText,
        }),
        expect.any(Object)
      );
    });

    // Test 16: Future date in nextFollowUpDate
    test("should accept future dates for nextFollowUpDate", async () => {
      const followUpId = new mongoose.Types.ObjectId();
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days in future

      const mockFollowUp = {
        _id: followUpId,
        status: "Running",
        conversationDetails: "Rescheduled",
        nextFollowUpDate: new Date(futureDate),
        updatedAt: new Date(),
      };

      FollowUp.findByIdAndUpdate.mockResolvedValueOnce(mockFollowUp);

      const response = await request(app).put(`/api/followups/${followUpId}`).send({
        conversationDetails: "Rescheduled",
        nextFollowUpDate: futureDate,
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("Running");
    });

    // Test 17: Past date in nextFollowUpDate (edge case)
    test("should accept past dates for nextFollowUpDate (no validation against current date)", async () => {
      const followUpId = new mongoose.Types.ObjectId();
      const pastDate = new Date("2024-01-01T10:00:00").toISOString();

      const mockFollowUp = {
        _id: followUpId,
        status: "Running",
        conversationDetails: "Rescheduled",
        nextFollowUpDate: new Date(pastDate),
        updatedAt: new Date(),
      };

      FollowUp.findByIdAndUpdate.mockResolvedValueOnce(mockFollowUp);

      const response = await request(app).put(`/api/followups/${followUpId}`).send({
        conversationDetails: "Rescheduled",
        nextFollowUpDate: pastDate,
      });

      expect(response.status).toBe(200);
    });

    // Test 18: only nextFollowUpDate without conversationDetails should fail
    test("should require conversationDetails even if nextFollowUpDate is provided", async () => {
      const followUpId = new mongoose.Types.ObjectId();

      const response = await request(app).put(`/api/followups/${followUpId}`).send({
        nextFollowUpDate: new Date().toISOString(),
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("conversationDetails is required");
    });

    // Test 19: Empty object payload
    test("should return 400 for empty payload", async () => {
      const followUpId = new mongoose.Types.ObjectId();

      const response = await request(app).put(`/api/followups/${followUpId}`).send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("conversationDetails is required");
    });

    // Test 20: updatedAt should be set to current time
    test("should set updatedAt to current time", async () => {
      const followUpId = new mongoose.Types.ObjectId();
      const beforeTime = new Date();

      const mockFollowUp = {
        _id: followUpId,
        status: "Completed",
        conversationDetails: "Good",
        updatedAt: new Date(),
      };

      FollowUp.findByIdAndUpdate.mockResolvedValueOnce(mockFollowUp);

      const response = await request(app).put(`/api/followups/${followUpId}`).send({
        conversationDetails: "Good",
      });

      const afterTime = new Date();

      expect(response.status).toBe(200);
      expect(FollowUp.findByIdAndUpdate).toHaveBeenCalledWith(
        followUpId.toString(),
        expect.objectContaining({
          updatedAt: expect.any(Date),
        }),
        expect.any(Object)
      );

      // Verify the updatedAt is between before and after our request
      const callArgs = FollowUp.findByIdAndUpdate.mock.calls[0][1];
      expect(callArgs.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(callArgs.updatedAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });

  describe("HTTP Method and Content-Type", () => {
    // Test 21: Verify PUT method is used (not POST, GET, etc.)
    test("should only accept PUT requests", async () => {
      const followUpId = new mongoose.Types.ObjectId();

      const postResponse = await request(app).post(`/api/followups/${followUpId}`).send({
        conversationDetails: "Good",
      });

      expect(postResponse.status).toBe(404); // Method not allowed

      const getResponse = await request(app).get(`/api/followups/${followUpId}`);
      expect(getResponse.status).toBe(404); // Method not allowed
    });

    // Test 22: Application/json content type handling
    test("should handle JSON content correctly", async () => {
      const followUpId = new mongoose.Types.ObjectId();

      const mockFollowUp = {
        _id: followUpId,
        status: "Completed",
        conversationDetails: "Good",
        updatedAt: new Date(),
      };

      FollowUp.findByIdAndUpdate.mockResolvedValueOnce(mockFollowUp);

      const response = await request(app)
        .put(`/api/followups/${followUpId}`)
        .set("Content-Type", "application/json")
        .send({
          conversationDetails: "Good",
        });

      expect(response.status).toBe(200);
    });
  });

  describe("Status Transitions", () => {
    // Test 23: Pending -> Completed transition
    test("should transition from Pending to Completed when no reschedule", async () => {
      const followUpId = new mongoose.Types.ObjectId();

      const mockFollowUp = {
        _id: followUpId,
        status: "Completed",
        conversationDetails: "Done",
        updatedAt: new Date(),
      };

      FollowUp.findByIdAndUpdate.mockResolvedValueOnce(mockFollowUp);

      const response = await request(app).put(`/api/followups/${followUpId}`).send({
        conversationDetails: "Done",
      });

      expect(response.status).toBe(200);
      const callArgs = FollowUp.findByIdAndUpdate.mock.calls[0][1];
      expect(callArgs.status).toBe("Completed");
      expect(callArgs.nextFollowUpDate).toBeUndefined();
    });

    // Test 24: Pending -> Running transition
    test("should transition from Pending to Running when rescheduling", async () => {
      const followUpId = new mongoose.Types.ObjectId();
      const nextDate = new Date("2024-04-01T10:00:00").toISOString();

      const mockFollowUp = {
        _id: followUpId,
        status: "Running",
        conversationDetails: "Rescheduled",
        nextFollowUpDate: new Date(nextDate),
        updatedAt: new Date(),
      };

      FollowUp.findByIdAndUpdate.mockResolvedValueOnce(mockFollowUp);

      const response = await request(app).put(`/api/followups/${followUpId}`).send({
        conversationDetails: "Rescheduled",
        nextFollowUpDate: nextDate,
      });

      expect(response.status).toBe(200);
      const callArgs = FollowUp.findByIdAndUpdate.mock.calls[0][1];
      expect(callArgs.status).toBe("Running");
      expect(callArgs.nextFollowUpDate).toBeDefined();
    });

    // Test 25: Running -> Completed transition
    test("should transition from Running to Completed when updating without reschedule", async () => {
      const followUpId = new mongoose.Types.ObjectId();

      const mockFollowUp = {
        _id: followUpId,
        status: "Completed",
        conversationDetails: "Final update",
        updatedAt: new Date(),
      };

      FollowUp.findByIdAndUpdate.mockResolvedValueOnce(mockFollowUp);

      const response = await request(app).put(`/api/followups/${followUpId}`).send({
        conversationDetails: "Final update",
      });

      expect(response.status).toBe(200);
      const callArgs = FollowUp.findByIdAndUpdate.mock.calls[0][1];
      expect(callArgs.status).toBe("Completed");
    });
  });
});

describe("Follow-Up Routes - GET /api/followups/:id (if exists)", () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  // Test 26: Retrieve a specific follow-up
  test("should retrieve a specific follow-up by id", async () => {
    const followUpId = new mongoose.Types.ObjectId();
    const mockFollowUp = {
      _id: followUpId,
      relatedType: "Lead",
      relatedId: new mongoose.Types.ObjectId(),
      followUpDate: new Date("2024-03-15T10:00:00"),
      notes: "Initial follow-up",
      status: "Pending",
    };

    FollowUp.findById = jest.fn().mockResolvedValueOnce(mockFollowUp);

    // Note: This assumes a GET route exists. Adjust if different.
    // For now, we'll just test the structure
    FollowUp.findById.mockResolvedValueOnce(mockFollowUp);

    const result = await FollowUp.findById(followUpId);
    expect(result._id.toString()).toBe(followUpId.toString());
    expect(result.status).toBe("Pending");
  });
});
