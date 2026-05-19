/**
 * Follow-Up API Service
 * Centralized API calls for all follow-up operations
 */

import { API_BASE_URL, API_ENDPOINTS } from '../constants/config';

class FollowUpService {
  /**
   * Get the full API URL
   */
  getApiUrl(endpoint) {
    return `${API_BASE_URL.replace(/\/$/, '')}${endpoint}`;
  }

  /**
   * Handle API response errors
   */
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || response.statusText || 'API Error');
    }
    return response.json();
  }

  // ============================================
  // FOLLOW-UP ENDPOINTS
  // ============================================

  /**
   * Get all follow-ups
   * @returns {Promise<Array>} Array of follow-ups
   */
  async getFollowUps() {
    try {
      const response = await fetch(this.getApiUrl(API_ENDPOINTS.FOLLOW_UPS));
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching follow-ups:', error);
      throw error;
    }
  }

  /**
   * Create a new follow-up
   * @param {Object} followUpData - Follow-up data
   * @returns {Promise<Object>} Created follow-up
   */
  async createFollowUp(followUpData) {
    try {
      const response = await fetch(this.getApiUrl(API_ENDPOINTS.FOLLOW_UPS), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(followUpData)
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error creating follow-up:', error);
      throw error;
    }
  }

  /**
   * Update an existing follow-up
   * @param {string} followUpId - Follow-up ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated follow-up
   */
  async updateFollowUp(followUpId, updateData) {
    try {
      const response = await fetch(
        this.getApiUrl(`${API_ENDPOINTS.FOLLOW_UPS}/${followUpId}`),
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`Error updating follow-up ${followUpId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a follow-up
   * @param {string} followUpId - Follow-up ID
   * @returns {Promise<void>}
   */
  async deleteFollowUp(followUpId) {
    try {
      const response = await fetch(
        this.getApiUrl(`${API_ENDPOINTS.FOLLOW_UPS}/${followUpId}`),
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error('Failed to delete follow-up');
      return await response.json();
    } catch (error) {
      console.error(`Error deleting follow-up ${followUpId}:`, error);
      throw error;
    }
  }

  // ============================================
  // LEADS ENDPOINTS
  // ============================================

  /**
   * Get all leads
   * @returns {Promise<Array>} Array of leads
   */
  async getLeads() {
    try {
      const response = await fetch(this.getApiUrl(API_ENDPOINTS.LEADS));
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
  }

  /**
   * Get a specific lead by ID
   * @param {string} leadId - Lead ID
   * @returns {Promise<Object>} Lead data
   */
  async getLeadById(leadId) {
    try {
      const response = await fetch(
        this.getApiUrl(`${API_ENDPOINTS.LEADS}/${leadId}`)
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`Error fetching lead ${leadId}:`, error);
      throw error;
    }
  }

  // ============================================
  // QUOTATIONS ENDPOINTS
  // ============================================

  /**
   * Get all quotations
   * @returns {Promise<Array>} Array of quotations
   */
  async getQuotations() {
    try {
      const response = await fetch(this.getApiUrl(API_ENDPOINTS.QUOTATIONS));
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching quotations:', error);
      throw error;
    }
  }

  /**
   * Get a specific quotation by ID
   * @param {string} quotationId - Quotation ID
   * @returns {Promise<Object>} Quotation data
   */
  async getQuotationById(quotationId) {
    try {
      const response = await fetch(
        this.getApiUrl(`${API_ENDPOINTS.QUOTATIONS}/${quotationId}`)
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`Error fetching quotation ${quotationId}:`, error);
      throw error;
    }
  }

  // ============================================
  // BATCH OPERATIONS
  // ============================================

  /**
   * Get counts for all tabs
   * @returns {Promise<Object>} Object with tab counts
   */
  async getTabCounts() {
    try {
      const [leads, quotations] = await Promise.all([
        this.getLeads(),
        this.getQuotations()
      ]);

      return {
        leads: Array.isArray(leads) ? leads.length : 0,
        quotations: Array.isArray(quotations) ? quotations.length : 0
      };
    } catch (error) {
      console.error('Error fetching tab counts:', error);
      throw error;
    }
  }

  /**
   * Get follow-ups with enriched entity details
   * @returns {Promise<Array>} Follow-ups with entity details
   */
  async getFollowUpsWithDetails() {
    try {
      const followUps = await this.getFollowUps();

      const withDetails = await Promise.all(
        followUps.map(async (followUp) => {
          let entityName = 'Unknown';
          let entityEmail = '-';
          let entityPhone = '-';

          try {
            if (followUp.relatedType === 'Lead') {
              const lead = await this.getLeadById(followUp.relatedId);
              entityName = lead.name || 'Unknown';
              entityEmail = lead.email || '-';
              entityPhone = lead.phone || '-';
            } else if (followUp.relatedType === 'Quotation') {
              const quotation = await this.getQuotationById(followUp.relatedId);
              entityName = quotation.customerName || 'Unknown';
              entityEmail = quotation.email || '-';
              entityPhone = quotation.phone || '-';
            }
          } catch (err) {
            console.warn(`Could not fetch entity details for ${followUp.relatedType}:`, err);
          }

          return {
            ...followUp,
            entityName,
            entityEmail,
            entityPhone
          };
        })
      );

      return withDetails;
    } catch (error) {
      console.error('Error fetching follow-ups with details:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new FollowUpService();
