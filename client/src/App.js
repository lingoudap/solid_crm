// client/src/App.js
import React, { useState } from 'react';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import HomePage from './HomePage';
import FollowUpDashboard from './Components/Dashboard/FollowUpDashboard';
import { SettingsProvider } from "./context/SettingsContext";

function App() {
  const [currentPage, setCurrentPage] = useState("login");
  const [loggedInUser, setLoggedInUser] = useState(null);

  // Set user when going to home
  const goToHome = (user) => {
    console.log("🔐 User logged in:", user);
    setLoggedInUser(user);
    setCurrentPage("home");
  };

  return (
    // ✅ Wrap everything inside SettingsProvider
    <SettingsProvider>
      <div>
        {currentPage === "login" && (
          <LoginPage
            goToRegister={() => setCurrentPage("register")}
            goToHome={(user) => goToHome(user)}
          />
        )}

        {currentPage === "register" && (
          <RegisterPage
            goToLogin={() => setCurrentPage("login")}
            goToHome={(user) => goToHome(user)}
          />
        )}

        {currentPage === "home" && (
          <HomePage setCurrentPage={setCurrentPage} loggedInUser={loggedInUser} />
        )}

        {currentPage === "dashboard" && (
          <FollowUpDashboard />
        )}
      </div>
    </SettingsProvider>
  );
}

export default App;
