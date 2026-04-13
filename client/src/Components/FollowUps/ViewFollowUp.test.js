import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ViewFollowUps from "./ViewFollowUp";

// Mock fetch globally
global.fetch = jest.fn();

describe("ViewFollowUps - Update Follow-Up Modal", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  // Test 1: Mock successful fetch of follow-ups list
  test("should fetch and display follow-ups on mount", async () => {
    const mockFollowUps = [
      {
        _id: "1",
        relatedType: "Lead",
        relatedId: "lead-1",
        followUpDate: new Date("2024-03-15T10:00:00").toISOString(),
        notes: "Initial follow-up",
        status: "Pending",
        entityName: "John Doe",
        entityEmail: "john@example.com",
      },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockFollowUps,
    });

    render(<ViewFollowUps />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
  });

  // Test 2: Open update modal when clicking update button
  test("should open update modal when Update button is clicked", async () => {
    const mockFollowUps = [
      {
        _id: "1",
        relatedType: "Lead",
        relatedId: "lead-1",
        followUpDate: new Date("2024-03-15T10:00:00").toISOString(),
        notes: "Initial follow-up",
        status: "Pending",
        entityName: "John Doe",
        entityEmail: "john@example.com",
      },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockFollowUps,
    });

    render(<ViewFollowUps />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const updateButton = screen.getByRole("button", { name: /Update/i });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText("📝 Update Follow-Up")).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: /Conversation Details/i })).toBeInTheDocument();
    });
  });

  // Test 3: Validation - conversationDetails is required
  test("should show error when conversationDetails is empty", async () => {
    const mockFollowUps = [
      {
        _id: "1",
        relatedType: "Lead",
        relatedId: "lead-1",
        followUpDate: new Date("2024-03-15T10:00:00").toISOString(),
        notes: "Initial follow-up",
        status: "Pending",
        entityName: "John Doe",
        entityEmail: "john@example.com",
      },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockFollowUps,
    });

    render(<ViewFollowUps />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Open modal
    const updateButton = screen.getByRole("button", { name: /Update/i });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText("📝 Update Follow-Up")).toBeInTheDocument();
    });

    // Click Update button without entering conversation details
    const submitButton = screen.getByRole("button", { name: /Update Follow-Up/i });
    fireEvent.click(submitButton);

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/Please enter conversation details/i)).toBeInTheDocument();
    });
  });

  // Test 4: Validation - time is required if date is set
  test("should show error when date is set but time is not", async () => {
    const mockFollowUps = [
      {
        _id: "1",
        relatedType: "Lead",
        relatedId: "lead-1",
        followUpDate: new Date("2024-03-15T10:00:00").toISOString(),
        notes: "Initial follow-up",
        status: "Pending",
        entityName: "John Doe",
        entityEmail: "john@example.com",
      },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockFollowUps,
    });

    render(<ViewFollowUps />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Open modal
    const updateButton = screen.getByRole("button", { name: /Update/i });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText("📝 Update Follow-Up")).toBeInTheDocument();
    });

    // Fill in conversation details
    const textArea = screen.getByPlaceholderText(/Enter conversation details here/i);
    fireEvent.change(textArea, { target: { value: "Good conversation" } });

    // Set only date without time
    const dateInput = screen.getByLabelText(/Next Date/i);
    fireEvent.change(dateInput, { target: { value: "2024-03-20" } });

    // Click Update button
    const submitButton = screen.getByRole("button", { name: /Update Follow-Up/i });
    fireEvent.click(submitButton);

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/Please enter time for the next follow-up/i)).toBeInTheDocument();
    });
  });

  // Test 5: Successful update without rescheduling
  test("should successfully update follow-up without rescheduling", async () => {
    const mockFollowUps = [
      {
        _id: "1",
        relatedType: "Lead",
        relatedId: "lead-1",
        followUpDate: new Date("2024-03-15T10:00:00").toISOString(),
        notes: "Initial follow-up",
        status: "Pending",
        entityName: "John Doe",
        entityEmail: "john@example.com",
      },
    ];

    const mockUpdatedFollowUp = {
      ...mockFollowUps[0],
      status: "Completed",
      conversationDetails: "Great conversation with positive outcome",
      updatedAt: new Date().toISOString(),
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockFollowUps,
    });

    render(<ViewFollowUps />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Open modal
    const updateButton = screen.getByRole("button", { name: /Update/i });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText("📝 Update Follow-Up")).toBeInTheDocument();
    });

    // Fill in conversation details
    const textArea = screen.getByPlaceholderText(/Enter conversation details here/i);
    fireEvent.change(textArea, { target: { value: "Great conversation with positive outcome" } });

    // Mock the PUT request
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUpdatedFollowUp,
    });

    // Mock the refetch
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockFollowUps,
    });

    // Click Update button
    const submitButton = screen.getByRole("button", { name: /Update Follow-Up/i });
    fireEvent.click(submitButton);

    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/Follow-up updated successfully!/i)).toBeInTheDocument();
    });

    // Verify that the correct PUT request was made
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/followups/1"),
      expect.objectContaining({
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationDetails: "Great conversation with positive outcome",
        }),
      })
    );
  });

  // Test 6: Successful update with rescheduling
  test("should successfully update follow-up with rescheduling", async () => {
    const mockFollowUps = [
      {
        _id: "1",
        relatedType: "Lead",
        relatedId: "lead-1",
        followUpDate: new Date("2024-03-15T10:00:00").toISOString(),
        notes: "Initial follow-up",
        status: "Pending",
        entityName: "John Doe",
        entityEmail: "john@example.com",
      },
    ];

    const mockUpdatedFollowUp = {
      ...mockFollowUps[0],
      status: "Running",
      conversationDetails: "Need to follow up later",
      nextFollowUpDate: new Date("2024-03-22T14:00:00").toISOString(),
      updatedAt: new Date().toISOString(),
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockFollowUps,
    });

    render(<ViewFollowUps />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Open modal
    const updateButton = screen.getByRole("button", { name: /Update/i });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText("📝 Update Follow-Up")).toBeInTheDocument();
    });

    // Fill in conversation details
    const textArea = screen.getByPlaceholderText(/Enter conversation details here/i);
    fireEvent.change(textArea, { target: { value: "Need to follow up later" } });

    // Set date and time
    const dateInput = screen.getByLabelText(/Next Date/i);
    const timeInput = screen.getByLabelText(/Time/i);

    fireEvent.change(dateInput, { target: { value: "2024-03-22" } });
    await waitFor(() => {
      expect(timeInput).not.toBeDisabled();
    });
    fireEvent.change(timeInput, { target: { value: "14:00" } });

    // Mock the PUT request
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUpdatedFollowUp,
    });

    // Mock the refetch
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockFollowUps,
    });

    // Click Update button
    const submitButton = screen.getByRole("button", { name: /Update Follow-Up/i });
    fireEvent.click(submitButton);

    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/Follow-up updated successfully!/i)).toBeInTheDocument();
    });

    // Verify that the correct PUT request was made with ISO date
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/followups/1"),
      expect.objectContaining({
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationDetails: "Need to follow up later",
          nextFollowUpDate: new Date("2024-03-22T14:00:00").toISOString(),
        }),
      })
    );
  });

  // Test 7: Handle network error
  test("should display error message on network failure", async () => {
    const mockFollowUps = [
      {
        _id: "1",
        relatedType: "Lead",
        relatedId: "lead-1",
        followUpDate: new Date("2024-03-15T10:00:00").toISOString(),
        notes: "Initial follow-up",
        status: "Pending",
        entityName: "John Doe",
        entityEmail: "john@example.com",
      },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockFollowUps,
    });

    render(<ViewFollowUps />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Open modal
    const updateButton = screen.getByRole("button", { name: /Update/i });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText("📝 Update Follow-Up")).toBeInTheDocument();
    });

    // Fill in conversation details
    const textArea = screen.getByPlaceholderText(/Enter conversation details here/i);
    fireEvent.change(textArea, { target: { value: "Great conversation" } });

    // Mock the PUT request to fail
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: "Server error" }),
    });

    // Click Update button
    const submitButton = screen.getByRole("button", { name: /Update Follow-Up/i });
    fireEvent.click(submitButton);

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/Server error/i)).toBeInTheDocument();
    });
  });

  // Test 8: Modal should close successfully after update (with timer)
  test("should close modal after successful update", async () => {
    jest.useFakeTimers();

    const mockFollowUps = [
      {
        _id: "1",
        relatedType: "Lead",
        relatedId: "lead-1",
        followUpDate: new Date("2024-03-15T10:00:00").toISOString(),
        notes: "Initial follow-up",
        status: "Pending",
        entityName: "John Doe",
        entityEmail: "john@example.com",
      },
    ];

    const mockUpdatedFollowUp = {
      ...mockFollowUps[0],
      status: "Completed",
      conversationDetails: "All good",
      updatedAt: new Date().toISOString(),
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockFollowUps,
    });

    render(<ViewFollowUps />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Open modal
    const updateButton = screen.getByRole("button", { name: /Update/i });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText("📝 Update Follow-Up")).toBeInTheDocument();
    });

    // Fill and submit
    const textArea = screen.getByPlaceholderText(/Enter conversation details here/i);
    fireEvent.change(textArea, { target: { value: "All good" } });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUpdatedFollowUp,
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockFollowUps,
    });

    const submitButton = screen.getByRole("button", { name: /Update Follow-Up/i });
    fireEvent.click(submitButton);

    // Verify success message appears
    await waitFor(() => {
      expect(screen.getByText(/Follow-up updated successfully!/i)).toBeInTheDocument();
    });

    // Fast-forward time to trigger modal close
    jest.runAllTimers();

    // Verify modal is closed
    await waitFor(() => {
      expect(screen.queryByText("📝 Update Follow-Up")).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  // Test 9: Button should be disabled during submission
  test("should disable form inputs and show loading spinner during submission", async () => {
    const mockFollowUps = [
      {
        _id: "1",
        relatedType: "Lead",
        relatedId: "lead-1",
        followUpDate: new Date("2024-03-15T10:00:00").toISOString(),
        notes: "Initial follow-up",
        status: "Pending",
        entityName: "John Doe",
        entityEmail: "john@example.com",
      },
    ];

    const mockUpdatedFollowUp = {
      ...mockFollowUps[0],
      status: "Completed",
      conversationDetails: "Good talk",
      updatedAt: new Date().toISOString(),
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockFollowUps,
    });

    render(<ViewFollowUps />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Open modal
    const updateButton = screen.getByRole("button", { name: /Update/i });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText("📝 Update Follow-Up")).toBeInTheDocument();
    });

    // Fill in conversation details
    const textArea = screen.getByPlaceholderText(/Enter conversation details here/i);
    fireEvent.change(textArea, { target: { value: "Good talk" } });

    // Create a promise that never resolves (to keep component in loading state)
    fetch.mockReturnValueOnce(
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: async () => mockUpdatedFollowUp,
          });
        }, 500);
      })
    );

    // Click Update button
    const submitButton = screen.getByRole("button", { name: /Update Follow-Up/i });
    fireEvent.click(submitButton);

    // Check that button shows loading state
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Updating/i })).toBeInTheDocument();
    });

    // Check that inputs are disabled
    expect(textArea).toBeDisabled();

    // Wait for request to complete
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  // Test 10: Cancel button should close modal without saving
  test("should close modal when cancel button is clicked", async () => {
    const mockFollowUps = [
      {
        _id: "1",
        relatedType: "Lead",
        relatedId: "lead-1",
        followUpDate: new Date("2024-03-15T10:00:00").toISOString(),
        notes: "Initial follow-up",
        status: "Pending",
        entityName: "John Doe",
        entityEmail: "john@example.com",
      },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockFollowUps,
    });

    render(<ViewFollowUps />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Open modal
    const updateButton = screen.getByRole("button", { name: /Update/i });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText("📝 Update Follow-Up")).toBeInTheDocument();
    });

    // Click Cancel button
    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelButton);

    // Verify modal is closed
    await waitFor(() => {
      expect(screen.queryByText("📝 Update Follow-Up")).not.toBeInTheDocument();
    });
  });
});
