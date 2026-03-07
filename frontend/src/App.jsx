import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import MedicinesPage from "./pages/MedicinesPage";
import SalesPage from "./pages/SalesPage";
import SuppliersPage from "./pages/SuppliersPage";
import PurchasesPage from "./pages/PurchasesPage";

const ProtectedShell = ({ children }) => (
  <ProtectedRoute>
    <AppLayout>{children}</AppLayout>
  </ProtectedRoute>
);

const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route
      path="/"
      element={
        <ProtectedShell>
          <DashboardPage />
        </ProtectedShell>
      }
    />
    <Route
      path="/medicines"
      element={
        <ProtectedShell>
          <MedicinesPage />
        </ProtectedShell>
      }
    />
    <Route
      path="/sales"
      element={
        <ProtectedShell>
          <SalesPage />
        </ProtectedShell>
      }
    />
    <Route
      path="/suppliers"
      element={
        <ProtectedShell>
          <SuppliersPage />
        </ProtectedShell>
      }
    />
    <Route
      path="/purchases"
      element={
        <ProtectedShell>
          <PurchasesPage />
        </ProtectedShell>
      }
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
