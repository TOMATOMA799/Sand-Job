import React from "react";
import { AuthProvider, useAuth } from "./AuthContext";
import SignInPage from "./SignInPage";
import DirectMessages from "./Applications/DirectMessages/DirectMessages";

function AppRoutes() {
  const { user } = useAuth();
  return user ? <DirectMessages /> : <SignInPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
