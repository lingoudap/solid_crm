import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./settings.css";

const defaultProfile = {
  companyName: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
  email: "",
  website: "",
  gstNumber: "",
  panNumber: "",
};

const CompanyProfile = ({ setActiveTab }) => {
  const [profile, setProfile] = useState(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const base = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const getUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.id || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      const userId = getUserId();
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${base.replace(/\/$/, "")}/api/company-profile/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setProfile({ ...defaultProfile, ...data.companyProfile });
        }
      } catch (err) {
        // Use defaults on error
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [base]);

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const userId = getUserId();
    if (!userId) {
      toast.error("User not found. Please login again.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${base.replace(/\/$/, "")}/api/company-profile/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        toast.success("Company profile saved successfully!");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save");
      }
    } catch (err) {
      toast.error("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-container">
        <div className="settings-card" style={{ textAlign: "center", padding: "40px" }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <ToastContainer />
      <div className="module-settings-header">
        <span className="module-settings-icon">🏢</span>
        <div>
          <h2>Company Profile</h2>
          <p className="module-settings-desc">Set your company details used in invoices, quotations, and print templates.</p>
        </div>
      </div>

      <div className="settings-card">
        <h3>Basic Information</h3>
        <div className="company-profile-grid">
          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Your Company Pvt. Ltd."
              value={profile.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              className="form-control"
              placeholder="+91 98765 43210"
              value={profile.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="info@company.com"
              value={profile.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Website</label>
            <input
              type="url"
              className="form-control"
              placeholder="https://www.company.com"
              value={profile.website}
              onChange={(e) => handleChange("website", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="settings-card">
        <h3>Address</h3>
        <div className="company-profile-grid">
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label>Street Address</label>
            <input
              type="text"
              className="form-control"
              placeholder="123, Main Road, Area Name"
              value={profile.address}
              onChange={(e) => handleChange("address", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              className="form-control"
              placeholder="Bengaluru"
              value={profile.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>State</label>
            <input
              type="text"
              className="form-control"
              placeholder="Karnataka"
              value={profile.state}
              onChange={(e) => handleChange("state", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>PIN Code</label>
            <input
              type="text"
              className="form-control"
              placeholder="560001"
              value={profile.pincode}
              onChange={(e) => handleChange("pincode", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="settings-card">
        <h3>Tax Details</h3>
        <div className="company-profile-grid">
          <div className="form-group">
            <label>GST Number</label>
            <input
              type="text"
              className="form-control"
              placeholder="29AAACR5055K1Z0"
              value={profile.gstNumber}
              onChange={(e) => handleChange("gstNumber", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>PAN Number</label>
            <input
              type="text"
              className="form-control"
              placeholder="AAACR5055K"
              value={profile.panNumber}
              onChange={(e) => handleChange("panNumber", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "24px" }}>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Company Profile"}
        </button>
        <button className="btn-secondary" onClick={() => setActiveTab(null)}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default CompanyProfile;
