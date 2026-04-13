import * as templateService from "./templateService";

// Mock fetch
global.fetch = jest.fn();

describe("Template Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    process.env.REACT_APP_USE_TEMPLATE_API = "false";
  });

  describe("API Methods", () => {
    // Test 1: Fetch templates from API
    test("should fetch templates from API", async () => {
      const mockTemplates = [
        { _id: "1", name: "Template 1", module: "Quotation" },
        { _id: "2", name: "Template 2", module: "Quotation" },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTemplates,
      });

      const result = await templateService.fetchTemplatesFromAPI("Quotation");

      expect(result).toEqual(mockTemplates);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/templates?module=Quotation")
      );
    });

    // Test 2: Handle fetch error
    test("should return empty array on fetch error", async () => {
      global.fetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await templateService.fetchTemplatesFromAPI("Quotation");

      expect(result).toEqual([]);
    });

    // Test 3: Fetch template by ID
    test("should fetch single template by ID", async () => {
      const mockTemplate = {
        _id: "123",
        name: "Test Template",
        module: "Quotation",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTemplate,
      });

      const result = await templateService.fetchTemplateByIdFromAPI("123");

      expect(result).toEqual(mockTemplate);
    });

    // Test 4: Save template to API (POST)
    test("should POST new template to API", async () => {
      const newTemplate = {
        name: "New Template",
        module: "Quotation",
        bodyFields: ["name", "email"],
      };

      const savedTemplate = { _id: "123", ...newTemplate };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => savedTemplate,
      });

      const result = await templateService.saveTemplateToAPI(newTemplate);

      expect(result).toEqual(savedTemplate);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/templates"),
        expect.objectContaining({ method: "POST" })
      );
    });

    // Test 5: Update template via API (PUT)
    test("should PUT updated template to API", async () => {
      const template = {
        _id: "123",
        name: "Updated Template",
        module: "Quotation",
      };

      const response = { ...template, lastModified: new Date() };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => response,
      });

      const result = await templateService.saveTemplateToAPI(template);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/templates/123"),
        expect.objectContaining({ method: "PUT" })
      );
    });

    // Test 6: Delete template from API
    test("should DELETE template from API", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "Deleted", id: "123" }),
      });

      const result = await templateService.deleteTemplateFromAPI("123");

      expect(result.message).toBe("Deleted");
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/templates/123"),
        expect.objectContaining({ method: "DELETE" })
      );
    });

    // Test 7: Handle API error response
    test("should throw error on non-ok response", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Template not found" }),
      });

      await expect(templateService.saveTemplateToAPI({})).rejects.toThrow(
        "Template not found"
      );
    });
  });

  describe("LocalStorage Methods", () => {
    // Test 8: Get templates from localStorage
    test("should retrieve templates from localStorage", () => {
      const templates = {
        Quotation: {
          "1": { name: "Template 1" },
          "2": { name: "Template 2" },
        },
      };

      localStorage.setItem("customPrintTemplates", JSON.stringify(templates));

      const result = templateService.getTemplatesFromLocalStorage("Quotation");

      expect(result).toEqual(templates.Quotation);
    });

    // Test 9: Return empty object for missing module
    test("should return empty object if module not found", () => {
      const templates = { Lead: { "1": { name: "Template 1" } } };
      localStorage.setItem("customPrintTemplates", JSON.stringify(templates));

      const result = templateService.getTemplatesFromLocalStorage("Quotation");

      expect(result).toEqual({});
    });

    // Test 10: Handle invalid localStorage data
    test("should return empty object on parse error", () => {
      localStorage.setItem("customPrintTemplates", "invalid-json");

      const result = templateService.getTemplatesFromLocalStorage("Quotation");

      expect(result).toEqual({});
    });

    // Test 11: Save templates to localStorage
    test("should save templates to localStorage", () => {
      const templates = { "1": { name: "Template 1" } };

      templateService.saveTemplatesToLocalStorage("Quotation", templates);

      const stored = JSON.parse(localStorage.getItem("customPrintTemplates"));

      expect(stored.Quotation).toEqual(templates);
    });

    // Test 12: Preserve other modules when saving
    test("should preserve other modules when saving", () => {
      const initial = {
        Lead: { "1": { name: "Lead Template" } },
      };

      localStorage.setItem("customPrintTemplates", JSON.stringify(initial));

      const quotationTemplates = { "2": { name: "Quote Template" } };
      templateService.saveTemplatesToLocalStorage("Quotation", quotationTemplates);

      const stored = JSON.parse(localStorage.getItem("customPrintTemplates"));

      expect(stored.Lead).toEqual(initial.Lead);
      expect(stored.Quotation).toEqual(quotationTemplates);
    });
  });

  describe("Unified Methods", () => {
    // Test 13: Get templates from localStorage by default
    test("should get templates from localStorage when API disabled", async () => {
      const templates = { "1": { name: "Template 1" } };
      localStorage.setItem(
        "customPrintTemplates",
        JSON.stringify({ Quotation: templates })
      );

      const result = await templateService.getTemplates("Quotation");

      expect(result).toEqual(templates);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    // Test 14: Get templates from API when enabled
    test("should get templates from API when enabled", async () => {
      process.env.REACT_APP_USE_TEMPLATE_API = "true";

      const mockTemplates = [{ _id: "1", name: "Template 1" }];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTemplates,
      });

      const result = await templateService.getTemplates("Quotation");

      expect(result).toEqual(mockTemplates);
    });

    // Test 15: Save template - localStorage route
    test("should save to localStorage when API disabled", async () => {
      const template = { name: "New Template", module: "Quotation" };

      const result = await templateService.saveTemplate(template);

      const stored = JSON.parse(localStorage.getItem("customPrintTemplates"));

      expect(stored.Quotation).toBeDefined();
      expect(Object.values(stored.Quotation)[0].name).toBe("New Template");
    });

    // Test 16: Delete template - localStorage route
    test("should delete from localStorage when API disabled", async () => {
      const templates = {
        "1": { name: "Template 1" },
        "2": { name: "Template 2" },
      };

      localStorage.setItem(
        "customPrintTemplates",
        JSON.stringify({ Quotation: templates })
      );

      await templateService.deleteTemplate("1", "Quotation");

      const stored = JSON.parse(localStorage.getItem("customPrintTemplates"));

      expect(stored.Quotation["1"]).toBeUndefined();
      expect(stored.Quotation["2"]).toBeDefined();
    });
  });

  describe("Conversion Methods", () => {
    // Test 17: Convert API template to localStorage format
    test("should convert API response to localStorage format", () => {
      const apiTemplate = {
        _id: "123",
        name: "Test Template",
        module: "Quotation",
        bodyFields: ["name", "email"],
        isDefault: true,
        paperSize: "A4",
        orientation: "portrait",
        createdAt: new Date(),
        lastModified: new Date(),
      };

      const result = templateService.convertAPITemplateToLocal(apiTemplate);

      expect(result.id).toBe("123");
      expect(result.name).toBe("Test Template");
      expect(result.isDefault).toBe(true);
    });

    // Test 18: Get default template
    test("should return default template if available", async () => {
      const templates = [
        { name: "Standard", isDefault: true },
        { name: "Detailed", isDefault: false },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => templates,
      });

      process.env.REACT_APP_USE_TEMPLATE_API = "true";

      const result = await templateService.getDefaultTemplate("Quotation");

      expect(result.name).toBe("Standard");
    });

    // Test 19: Fallback to first template if no default
    test("should return first template if no default exists", async () => {
      const templates = [
        { name: "Standard", isDefault: false },
        { name: "Detailed", isDefault: false },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => templates,
      });

      process.env.REACT_APP_USE_TEMPLATE_API = "true";

      const result = await templateService.getDefaultTemplate("Quotation");

      expect(result.name).toBe("Standard");
    });

    // Test 20: Return null when no templates exist
    test("should return null when no templates exist", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      process.env.REACT_APP_USE_TEMPLATE_API = "true";

      const result = await templateService.getDefaultTemplate("Quotation");

      expect(result).toBeNull();
    });
  });

  describe("Migration Methods", () => {
    // Test 21: Sync localStorage to API
    test("should sync templates from localStorage to API", async () => {
      const templates = {
        Lead: { "1": { name: "Lead Template" } },
        Quotation: { "2": { name: "Quote Template" } },
      };

      localStorage.setItem("customPrintTemplates", JSON.stringify(templates));

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: "new-id" }),
      });

      const result = await templateService.syncLocalStorageToAPI();

      expect(result.message).toContain("Synced");
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
