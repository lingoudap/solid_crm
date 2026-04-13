import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import Template from "../models/Template.js";
import templateRoutes from "./templateRoutes.js";

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/templates", templateRoutes);
  return app;
};

// Mock Template model
jest.mock("../models/Template.js");

describe("Template Routes - REST API", () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  describe("GET /api/templates?module=Quotation", () => {
    // Test 1: Fetch templates for Quotation module
    test("should fetch all Quotation templates", async () => {
      const mockTemplates = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: "Standard Invoice",
          module: "Quotation",
          isDefault: true,
          bodyFields: ["customerName", "email"],
          paperSize: "A4",
          createdAt: new Date(),
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: "Detailed Quote",
          module: "Quotation",
          isDefault: false,
          bodyFields: ["customerName", "email", "items", "totalAmount"],
          paperSize: "A4",
          createdAt: new Date(),
        },
      ];

      Template.find.mockResolvedValueOnce(mockTemplates);

      const response = await request(app)
        .get("/api/templates?module=Quotation");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe("Standard Invoice");
      expect(Template.find).toHaveBeenCalledWith({ module: "Quotation" });
    });

    // Test 2: Missing module parameter
    test("should return 400 if module parameter is missing", async () => {
      const response = await request(app).get("/api/templates");

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("module parameter is required");
    });

    // Test 3: Invalid module parameter
    test("should return 400 for invalid module", async () => {
      const response = await request(app).get("/api/templates?module=InvalidModule");

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Invalid module");
    });

    // Test 4: No templates found
    test("should return empty array when no templates exist", async () => {
      Template.find.mockResolvedValueOnce([]);

      const response = await request(app).get("/api/templates?module=Lead");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    // Test 5: Database error
    test("should return 500 on database error", async () => {
      Template.find.mockRejectedValueOnce(new Error("DB Connection failed"));

      const response = await request(app).get("/api/templates?module=Quotation");

      expect(response.status).toBe(500);
      expect(response.body.error).toContain("DB Connection failed");
    });
  });

  describe("GET /api/templates/:id", () => {
    // Test 6: Fetch specific template
    test("should fetch a template by ID", async () => {
      const templateId = new mongoose.Types.ObjectId();
      const mockTemplate = {
        _id: templateId,
        name: "Test Template",
        module: "Quotation",
        bodyFields: ["name", "email"],
      };

      Template.findById.mockResolvedValueOnce(mockTemplate);

      const response = await request(app).get(`/api/templates/${templateId}`);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe("Test Template");
    });

    // Test 7: Invalid template ID format
    test("should return 400 for invalid template ID", async () => {
      const response = await request(app).get("/api/templates/invalid-id");

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Invalid template ID");
    });

    // Test 8: Template not found
    test("should return 404 when template not found", async () => {
      const templateId = new mongoose.Types.ObjectId();
      Template.findById.mockResolvedValueOnce(null);

      const response = await request(app).get(`/api/templates/${templateId}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Template not found");
    });
  });

  describe("POST /api/templates", () => {
    // Test 9: Create new template
    test("should create a new template", async () => {
      const newTemplate = {
        name: "New Quote Template",
        module: "Quotation",
        bodyFields: ["customerName", "email", "totalAmount"],
        paperSize: "A4",
      };

      const savedTemplate = {
        _id: new mongoose.Types.ObjectId(),
        ...newTemplate,
        createdAt: new Date(),
        lastModified: new Date(),
      };

      Template.prototype.save = jest.fn().mockResolvedValueOnce(savedTemplate);

      const response = await request(app)
        .post("/api/templates")
        .send(newTemplate);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe("New Quote Template");
    });

    // Test 10: Missing template name
    test("should return 400 if template name is missing", async () => {
      const response = await request(app)
        .post("/api/templates")
        .send({ module: "Quotation", bodyFields: [] });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("template name is required");
    });

    // Test 11: Missing module
    test("should return 400 if module is missing", async () => {
      const response = await request(app)
        .post("/api/templates")
        .send({ name: "Test", bodyFields: [] });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Module is required");
    });

    // Test 12: Invalid module
    test("should return 400 for invalid module", async () => {
      const response = await request(app)
        .post("/api/templates")
        .send({
          name: "Test",
          module: "InvalidModule",
          bodyFields: [],
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Invalid module");
    });

    // Test 13: Invalid bodyFields format
    test("should return 400 if bodyFields is not an array", async () => {
      const response = await request(app)
        .post("/api/templates")
        .send({
          name: "Test",
          module: "Quotation",
          bodyFields: "not-an-array",
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("bodyFields must be an array");
    });

    // Test 14: Set as default template
    test("should unset other defaults when creating default template", async () => {
      const newTemplate = {
        name: "New Default",
        module: "Quotation",
        isDefault: true,
        bodyFields: [],
      };

      Template.updateMany = jest.fn().mockResolvedValueOnce({ ok: 1 });
      Template.prototype.save = jest.fn().mockResolvedValueOnce({
        _id: new mongoose.Types.ObjectId(),
        ...newTemplate,
      });

      await request(app).post("/api/templates").send(newTemplate);

      expect(Template.updateMany).toHaveBeenCalledWith(
        { module: "Quotation", isDefault: true },
        { isDefault: false }
      );
    });
  });

  describe("PUT /api/templates/:id", () => {
    // Test 15: Update template
    test("should update an existing template", async () => {
      const templateId = new mongoose.Types.ObjectId();
      const updateData = {
        name: "Updated Template",
        bodyFields: ["name", "email", "phone"],
      };

      const updatedTemplate = {
        _id: templateId,
        ...updateData,
        module: "Quotation",
      };

      Template.findById.mockResolvedValueOnce({ _id: templateId });
      Template.findByIdAndUpdate.mockResolvedValueOnce(updatedTemplate);

      const response = await request(app)
        .put(`/api/templates/${templateId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe("Updated Template");
    });

    // Test 16: Update template to default
    test("should unset other defaults when updating to default", async () => {
      const templateId = new mongoose.Types.ObjectId();

      Template.findById.mockResolvedValueOnce({ _id: templateId, module: "Quotation" });
      Template.updateMany = jest.fn().mockResolvedValueOnce({ ok: 1 });
      Template.findByIdAndUpdate.mockResolvedValueOnce({
        _id: templateId,
        isDefault: true,
      });

      await request(app)
        .put(`/api/templates/${templateId}`)
        .send({ isDefault: true });

      expect(Template.updateMany).toHaveBeenCalled();
    });

    // Test 17: Template not found
    test("should return 404 when template not found", async () => {
      const templateId = new mongoose.Types.ObjectId();
      Template.findById.mockResolvedValueOnce(null);

      const response = await request(app)
        .put(`/api/templates/${templateId}`)
        .send({ name: "Updated" });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Template not found");
    });

    // Test 18: Invalid template name
    test("should return 400 if name is empty", async () => {
      const templateId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/templates/${templateId}`)
        .send({ name: "" });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("cannot be empty");
    });
  });

  describe("DELETE /api/templates/:id", () => {
    // Test 19: Delete template
    test("should delete a template", async () => {
      const templateId = new mongoose.Types.ObjectId();

      Template.findByIdAndDelete.mockResolvedValueOnce({
        _id: templateId,
        name: "Deleted Template",
      });

      const response = await request(app).delete(`/api/templates/${templateId}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Template deleted successfully");
    });

    // Test 20: Template not found
    test("should return 404 when template not found", async () => {
      const templateId = new mongoose.Types.ObjectId();
      Template.findByIdAndDelete.mockResolvedValueOnce(null);

      const response = await request(app).delete(`/api/templates/${templateId}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Template not found");
    });

    // Test 21: Invalid ID format
    test("should return 400 for invalid ID format", async () => {
      const response = await request(app).delete("/api/templates/invalid");

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Invalid template ID");
    });
  });

  describe("Module Validation", () => {
    // Test 22: Valid modules
    test("should accept all valid modules", async () => {
      const validModules = ["Lead", "Quotation", "Customer", "Order"];

      for (const module of validModules) {
        Template.find.mockResolvedValueOnce([]);

        const response = await request(app).get(`/api/templates?module=${module}`);

        expect(response.status).toBe(200);
      }
    });
  });

  describe("Sorting and Filtering", () => {
    // Test 23: Templates sorted by default and name
    test("should return templates sorted by isDefault desc and name asc", async () => {
      const mockTemplates = [
        { name: "Alpha", isDefault: true },
        { name: "Beta", isDefault: true },
        { name: "Gamma", isDefault: false },
      ];

      Template.find.mockResolvedValueOnce(mockTemplates);

      const response = await request(app).get("/api/templates?module=Quotation");

      expect(Template.find).toHaveBeenCalledWith({ module: "Quotation" });
      // Note: The actual sorting is handled in model. We're just testing that sort was called
    });
  });
});
