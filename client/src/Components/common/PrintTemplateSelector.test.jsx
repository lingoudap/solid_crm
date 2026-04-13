import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PrintTemplateSelector from "./PrintTemplateSelector";
import * as templateService from "../../services/templateService";

// Mock template service
jest.mock("../../services/templateService");

// Mock print libraries
jest.mock("../../utils/printTemplateUtils", () => ({
  generatePDFFromTemplate: jest.fn().mockResolvedValue({ success: true }),
  loadPrintLibraries: jest.fn().mockResolvedValue(true),
}));

// Mock window.print
window.print = jest.fn();

describe("PrintTemplateSelector Component", () => {
  const mockTemplates = [
    {
      id: "1",
      name: "Standard Quote",
      module: "Quotation",
      bodyFields: ["customerName", "email", "totalAmount"],
      paperSize: "A4",
      orientation: "portrait",
      isDefault: true,
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
      headerContent: "Invoice",
      footerContent: "Thank you for your business",
      fontSize: "12px",
      fontFamily: "Arial",
      lineSpacing: "1.5",
    },
    {
      id: "2",
      name: "Detailed Quote",
      module: "Quotation",
      bodyFields: ["customerName", "company", "email", "phone", "items", "totalAmount"],
      paperSize: "A4",
      orientation: "portrait",
      isDefault: false,
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
    },
  ];

  const mockRecord = {
    customerName: "John Doe",
    company: "Acme Corp",
    email: "john@example.com",
    phone: "555-1234",
    totalAmount: 1000,
    items: [
      { name: "Item 1", qty: 2, price: 500 },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("companyName", "Test Company");
    templateService.getTemplates.mockResolvedValue(mockTemplates);
    templateService.convertAPITemplateToLocal.mockImplementation((t) => t);
  });

  // Test 1: Render print button
  test("should render print button", async () => {
    render(
      <PrintTemplateSelector module="Quotation" record={mockRecord} />
    );

    const button = screen.getByRole("button", { name: /Print/i });
    expect(button).toBeInTheDocument();
  });

  // Test 2: Load templates on mount
  test("should load templates when component mounts", async () => {
    render(
      <PrintTemplateSelector module="Quotation" record={mockRecord} />
    );

    await waitFor(() => {
      expect(templateService.getTemplates).toHaveBeenCalledWith("Quotation");
    });
  });

  // Test 3: Auto-select default template
  test("should auto-select default template if available", async () => {
    render(
      <PrintTemplateSelector module="Quotation" record={mockRecord} />
    );

    await waitFor(() => {
      expect(screen.getByText("Standard Quote")).toBeInTheDocument();
    });
  });

  // Test 4: Show template selector dropdown
  test("should show template selector dropdown when print button is clicked", async () => {
    render(
      <PrintTemplateSelector module="Quotation" record={mockRecord} />
    );

    const button = screen.getByRole("button", { name: /Print/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Select Template:")).toBeInTheDocument();
    });
  });

  // Test 5: Hide selector when clicking print button again
  test("should hide selector when print button is clicked again", async () => {
    render(
      <PrintTemplateSelector module="Quotation" record={mockRecord} />
    );

    const button = screen.getByRole("button", { name: /Print/i });
    
    // Open
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText("Select Template:")).toBeInTheDocument();
    });

    // Close
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.queryByText("Select Template:")).not.toBeInTheDocument();
    });
  });

  // Test 6: Change selected template
  test("should update selected template when dropdown value changes", async () => {
    render(
      <PrintTemplateSelector module="Quotation" record={mockRecord} />
    );

    const button = screen.getByRole("button", { name: /Print/i });
    fireEvent.click(button);

    await waitFor(() => {
      const select = screen.getByDisplayValue("Standard Quote");
      expect(select).toBeInTheDocument();
    });

    const select = screen.getByDisplayValue("Standard Quote");
    fireEvent.change(select, { target: { value: "2" } });

    await waitFor(() => {
      expect(screen.getByDisplayValue("Detailed Quote")).toBeInTheDocument();
    });
  });

  // Test 7: Display no templates message
  test("should show no templates message when no templates exist", async () => {
    templateService.getTemplates.mockResolvedValue([]);

    render(
      <PrintTemplateSelector module="Quotation" record={mockRecord} />
    );

    await waitFor(() => {
      expect(screen.getByText(/No Templates/i)).toBeInTheDocument();
    });
  });

  // Test 8: Print button disabled without template
  test("should disable print button if no template is selected initially", async () => {
    templateService.getTemplates.mockResolvedValue([]);

    render(
      <PrintTemplateSelector module="Quotation" record={mockRecord} />
    );

    await waitFor(() => {
      const button = screen.getByRole("button", { name: /No Templates/i });
      expect(button).toBeDisabled();
    });
  });

  // Test 9: Reload templates when module changes
  test("should reload templates when module prop changes", async () => {
    const { rerender } = render(
      <PrintTemplateSelector module="Quotation" record={mockRecord} />
    );

    await waitFor(() => {
      expect(templateService.getTemplates).toHaveBeenCalledWith("Quotation");
    });

    jest.clearAllMocks();
    templateService.getTemplates.mockResolvedValue([]);

    rerender(
      <PrintTemplateSelector module="Lead" record={mockRecord} />
    );

    await waitFor(() => {
      expect(templateService.getTemplates).toHaveBeenCalledWith("Lead");
    });
  });

  // Test 10: Show preview button
  test("should show preview button when selector is open", async () => {
    render(
      <PrintTemplateSelector module="Quotation" record={mockRecord} />
    );

    const printBtn = screen.getByRole("button", { name: /Print/i });
    fireEvent.click(printBtn);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Preview/i })).toBeInTheDocument();
    });
  });

  // Test 11: Close button closes selector
  test("should close selector when close button is clicked", async () => {
    render(
      <PrintTemplateSelector module="Quotation" record={mockRecord} />
    );

    const printBtn = screen.getByRole("button", { name: /Print/i });
    fireEvent.click(printBtn);

    await waitFor(() => {
      expect(screen.getByText("Select Template:")).toBeInTheDocument();
    });

    const closeBtn = screen.getByRole("button", { name: /Close/i });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText("Select Template:")).not.toBeInTheDocument();
    });
  });

  // Test 12: Display template info
  test("should display selected template info", async () => {
    render(
      <PrintTemplateSelector module="Quotation" record={mockRecord} />
    );

    const printBtn = screen.getByRole("button", { name: /Print/i });
    fireEvent.click(printBtn);

    await waitFor(() => {
      expect(screen.getByText(/A4 portrait/i)).toBeInTheDocument();
      expect(screen.getByText(/3 fields/i)).toBeInTheDocument();
    });
  });

  // Test 13: Print button calls onPrint callback
  test("should call onPrint callback when print is successful", async () => {
    const onPrint = jest.fn();

    render(
      <PrintTemplateSelector 
        module="Quotation" 
        record={mockRecord}
        onPrint={onPrint}
      />
    );

    const printBtn = screen.getByRole("button", { name: /Print/i });
    fireEvent.click(printBtn);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Processing/i })).toBeDisabled();
    });

    const printActionBtn = screen.getByRole("button", { name: /Processing|Print/i });
    if (!printActionBtn.disabled) {
      fireEvent.click(printActionBtn);
    } else {
      // Wait for async operation to complete
      await waitFor(() => {
        expect(onPrint).toHaveBeenCalledWith(mockTemplates[0]);
      });
    }
  });

  // Test 14: Error handling
  test("should display error message on print failure", async () => {
    const { generatePDFFromTemplate } = require("../../utils/printTemplateUtils");
    generatePDFFromTemplate.mockRejectedValueOnce(new Error("PDF generation failed"));

    render(
      <PrintTemplateSelector module="Quotation" record={mockRecord} />
    );

    const printBtn = screen.getByRole("button", { name: /Print/i });
    fireEvent.click(printBtn);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Print/i })).toBeInTheDocument();
    });

    const printActionBtn = screen.getAllByRole("button").find(
      (btn) => btn.textContent.includes("Print") && !btn.textContent.includes("Preview")
    );
    fireEvent.click(printActionBtn);

    await waitFor(() => {
      expect(screen.getByText(/PDF generation failed/i)).toBeInTheDocument();
    });
  });

  // Test 15: Show default badge on default template
  test("should show default badge on default template", async () => {
    render(
      <PrintTemplateSelector module="Quotation" record={mockRecord} />
    );

    const printBtn = screen.getByRole("button", { name: /Print/i });
    fireEvent.click(printBtn);

    await waitFor(() => {
      expect(screen.getByText("Standard Quote (Default)")).toBeInTheDocument();
    });
  });

  // Test 16: Handle API fetch errors
  test("should display error when templates fail to load", async () => {
    templateService.getTemplates.mockRejectedValueOnce(
      new Error("API request failed")
    );

    render(
      <PrintTemplateSelector module="Quotation" record={mockRecord} />
    );

    await waitFor(() => {
      expect(screen.getByText(/No Templates/i)).toBeInTheDocument();
    });
  });

  // Test 17: Preview modal opens and closes
  test("should open and close preview modal", async () => {
    render(
      <PrintTemplateSelector module="Quotation" record={mockRecord} />
    );

    const printBtn = screen.getByRole("button", { name: /Print/i });
    fireEvent.click(printBtn);

    await waitFor(() => {
      const previewBtn = screen.getByRole("button", { name: /Preview/i });
      expect(previewBtn).toBeInTheDocument();
      fireEvent.click(previewBtn);
    });

    await waitFor(() => {
      expect(screen.getByText(/Print Preview/i)).toBeInTheDocument();
    });

    const closePreviewBtn = screen.getAllByRole("button").find(
      (btn) => btn.textContent === "✕"
    );
    fireEvent.click(closePreviewBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Print Preview/i)).not.toBeInTheDocument();
    });
  });

  // Test 18: Multiple modules supported
  test("should support different modules", async () => {
    const leadTemplate = {
      id: "3",
      name: "Lead Report",
      module: "Lead",
      bodyFields: ["name", "email", "company"],
    };

    templateService.getTemplates.mockResolvedValue([leadTemplate]);

    render(
      <PrintTemplateSelector module="Lead" record={mockRecord} />
    );

    await waitFor(() => {
      expect(templateService.getTemplates).toHaveBeenCalledWith("Lead");
    });
  });
});
