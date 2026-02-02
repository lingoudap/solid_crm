import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "./settings.css";

const GeneralSettings = ({ setActiveTab }) => {
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("English");
  const [notifications, setNotifications] = useState(true);
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setTheme(parsed.theme || "light");
        setLanguage(parsed.language || "English");
        setNotifications(parsed.notifications !== false);
        if (parsed.logo) {
          setLogoPreview(parsed.logo);
        }
      } catch (e) {
        console.warn("Failed to parse saved settings:", e);
      }
    }
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file");
        return;
      }
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024 * 1024) {
        toast.error("Logo size should be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        console.log("📷 Logo file read, size:", base64.length);
        setLogo(base64);
        setLogoPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async () => {
    console.log("🔄 Starting to save settings...");

    // Get user from localStorage
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      toast.error("❌ User not found. Please login again.");
      return;
    }

    let user;
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      toast.error("❌ Invalid user data");
      return;
    }

    console.log("👤 User ID:", user.id);
    console.log("🔄 Saving settings, logoPreview:", !!logoPreview, "length:", logoPreview?.length);

    const updatedSettings = {
      logo: logoPreview || null,
      theme,
      language,
      notifications,
      autoSave: true
    };

    if (logoPreview) {
      console.log("✅ Logo included in settings, size:", logoPreview.length);
    }

    try {
      // First, save to localStorage for immediate use
      localStorage.setItem("userSettings", JSON.stringify(updatedSettings));
      console.log("✅ Settings saved to localStorage successfully");

      // Then save to backend - this is critical for persistence
      if (user.id) {
        console.log("📤 Sending company settings to backend for user:", user.id);
        console.log("📊 Settings payload size:", JSON.stringify(updatedSettings).length);

        const backendRes = await fetch(
          `http://localhost:5000/api/company-settings/${user.id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify(updatedSettings)
          }
        );

        const backendData = await backendRes.json();

        if (backendRes.ok) {
          console.log("✅ Company settings saved to backend successfully");
          console.log("📝 Backend response:", backendData);
        } else {
          console.error("❌ Backend error:", backendData.error);
          toast.warning("⚠️ Settings saved locally but failed to sync with server: " + (backendData.error || "Unknown error"));
        }
      } else {
        console.warn("⚠️ No user ID found, cannot save to backend");
        toast.warning("⚠️ Could not sync settings to server");
      }
    } catch (e) {
      console.error("❌ Error saving settings:", e);
      toast.error("Failed to save settings: " + e.message);
      return;
    }

    // Dispatch custom event to notify other components about settings update
    console.log("📢 Dispatching settingsUpdated event");
    window.dispatchEvent(new CustomEvent("settingsUpdated", {
      detail: updatedSettings,
      bubbles: true
    }));

    // Also trigger storage event for same-page updates
    setTimeout(() => {
      console.log("📢 Dispatching storage event");
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'userSettings',
        newValue: JSON.stringify(updatedSettings),
        oldValue: null,
        storageArea: localStorage
      }));
    }, 100);

    toast.success("✅ Settings saved successfully!");
    setLogo(null);
  };

  return (
    <div className="settings-container">
      <ToastContainer />
      <div className="settings-card">
        <h2>⚙️ General Settings</h2>



        <div className="form-group">
          <label>Theme</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="form-control"
          >
            <option value="light">🌞 Light Mode</option>
            <option value="dark">🌙 Dark Mode</option>
          </select>
        </div>





        <div className="form-group">
          <label>Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="form-control"
          >
            <option>English</option>
            <option>Hindi</option>
            <option>Kannada</option>
          </select>
        </div>

        <div className="form-group toggle">
          <label>Notifications</label>
          <input
            type="checkbox"
            checked={notifications}
            onChange={() => setNotifications(!notifications)}
          />
        </div>
        {/* Logo Upload Section */}
        <div className="form-group">
          <label>🎨 Application Logo</label>
          <div className="logo-upload-section">
            <div className="logo-preview-container">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo Preview"
                  className="logo-preview"
                  style={{
                    maxWidth: "150px",
                    maxHeight: "150px",
                    objectFit: "contain"
                  }}
                />
              ) : (
                <div className="logo-placeholder">
                  <span style={{ fontSize: "48px" }}>📷</span>
                  <p>No logo uploaded</p>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="form-control"
              style={{ marginTop: "10px" }}
            />
            <small style={{ display: "block", marginTop: "5px", color: "#666" }}>
              Recommended size: 200x200px | Max size: 2MB
            </small>
            {logoPreview && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setLogoPreview(null);
                  setLogo(null);
                }}
                style={{ marginTop: "10px" }}
              >
                🗑️ Remove Logo
              </button>
            )}
          </div>
        </div>

        <button className="btn-primary mt-3" onClick={handleSaveSettings}>
          💾 Save Settings
        </button>
      </div>
      <div className="text-center mt-10">
        <button className="btn-secondary" onClick={() => setActiveTab && setActiveTab(null)}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default GeneralSettings;
