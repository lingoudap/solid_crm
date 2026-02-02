import React, { useContext, useState, useEffect } from "react";
import { useSettings } from "../../context/SettingsContext";
import "./AddLead.css";

const AddLead = ({ onLeadAdded }) => {
  const leadSources = ["Friend", "Walk In", "Social Media", "Other"];
  const token = localStorage.getItem("token");
  const { moduleSettings: settings } = useSettings();
  const customFields = settings?.customFields?.Lead || [];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    state: "",
    Source: "",
    followUpDate: "",
    followUpTime: "",
    followUpRemark: "",
    ...Object.fromEntries(customFields.map(field => [field.label, ""]))
  });

  // Keep formData keys in sync when custom fields change (add/remove)
  useEffect(() => {
    setFormData(prev => {
      const entries = Object.fromEntries(customFields.map(field => [field.label, prev[field.label] || ""]));
      return { ...prev, ...entries };
    });
  }, [customFields]);

  const handleChange = (e) => {
    let value = e.target.value;
    // Restrict phone field to exactly 10 digits
    if (e.target.name === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate phone number - must be exactly 10 digits
    if (!formData.phone || formData.phone.length !== 10) {
      alert("❌ Phone number must be exactly 10 digits");
      return;
    }

    // Extract custom field values
    const customFieldValues = {};
    customFields.forEach(field => {
      customFieldValues[field.label] = formData[field.label];
    });

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      state: formData.state,
      Source: formData.Source,
      followUps: [
        {
          date: formData.followUpDate,
          time: formData.followUpTime || "00:00",
          remark: formData.followUpRemark,
        },
      ],
      customFields: customFieldValues // Add custom fields to payload
    };

    try {
      const base = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const response = await fetch(`${base}/api/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
          , "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to add lead");
      alert("✅ Lead added successfully!");

      // Reset form including custom fields
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        state: "",
        Source: "",
        followUpDate: "",
        followUpTime: "",
        followUpRemark: "",
        ...Object.fromEntries(customFields.map(field => [field.label, ""]))
      });

      if (onLeadAdded) onLeadAdded();
    } catch (error) {
      alert(`❌ ${error.message}`);
    }
  };

  const renderCustomField = (field) => {
    const fieldProps = {
      name: field.label,
      value: formData[field.label] || "",
      onChange: handleChange,
      required: field.required,
      className: "border p-2 w-full mb-4"
    };

    switch (field.type) {
      case "text":
      case "email":
      case "number":
        return (
          <input
            type={field.type}
            {...fieldProps}
          />
        );
      case "textarea":
        return (
          <textarea
            {...fieldProps}
          />
        );
      case "dropdown":
        const options = Array.isArray(field.options)
          ? field.options
          : typeof field.options === "string"
            ? field.options.split(",").map(opt => opt.trim())
            : [];
        return (
          <select {...fieldProps}>
            <option value="">Select {field.label}</option>
            {options.map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      case "checkbox":
        return (
          <input
            type="checkbox"
            checked={formData[field.label] || false}
            {...fieldProps}
          />
        );
      case "date":
        return (
          <input
            type="date"
            {...fieldProps}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="add-form p-6">
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">➕ Add Lead</h2>

        {/* Lead Information Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-blue-800 border-b pb-2">
            📋 Lead Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="border p-2 w-full rounded-md"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="border p-2 w-full rounded-md"
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter 10 digit phone number"
                value={formData.phone}
                onChange={handleChange}
                maxLength="10"
                className="border p-2 w-full rounded-md"
                required
              />
              <small style={{ display: 'block', marginTop: '4px', color: formData.phone.length === 10 ? '#16a34a' : '#666', fontWeight: formData.phone.length === 10 ? 'bold' : 'normal' }}>
                {formData.phone.length}/10 digits
              </small>
            </div>

            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="border p-2 w-full rounded-md"
              />
            </div>

            <div className="form-group col-span-2">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="border p-2 w-full rounded-md"
                required
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Source</label>
              <select
                name="Source"
                value={formData.Source}
                onChange={handleChange}
                className="border p-2 w-full rounded-md"
                required
              >
                <option value="">Select Source Type</option>
                {leadSources.map((src, i) => (
                  <option key={i} value={src}>{src}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Follow-Up Information Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-blue-800 border-b pb-2">
            📅 Follow-Up Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label>Follow-Up Date</label>
              <input
                type="date"
                name="followUpDate"
                value={formData.followUpDate}
                onChange={handleChange}
                className="border p-2 w-full rounded-md"
                required
              />
            </div>

            <div className="form-group">
              <label>Follow-Up Time</label>
              <input
                type="time"
                name="followUpTime"
                value={formData.followUpTime}
                onChange={handleChange}
                className="border p-2 w-full rounded-md"
              />
            </div>

            <div className="form-group col-span-2">
              <label>Follow-Up Remark</label>
              <input
                type="text"
                name="followUpRemark"
                value={formData.followUpRemark}
                onChange={handleChange}
                className="border p-2 w-full rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Custom Fields Section */}
        {customFields.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-800 border-b pb-2">
              ⚙️ Custom Fields
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {customFields.map((field, index) => (
                <div key={index} className="form-group">
                  <label>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderCustomField(field)}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transform hover:-translate-y-0.5 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
          >
            Save Lead
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLead;