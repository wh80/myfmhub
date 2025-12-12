import { Routes, Route, Link } from "react-router-dom";

import AuthenticatedLayout from "./shared/layouts/AuthenticatedLayout";
import RegisterPage from "./features/accounts/pages/RegisterPage";

import AccountViewPage from "./features/accounts/pages/AccountViewPage";

import LoginPage from "./features/auth/pages/LoginPage";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "./features/auth/pages/ResetPasswordPage";
import UpdatePasswordPage from "./features/auth/pages/UpdatePasswordPage";

import LocationsIndexPage from "./features/locations/pages/LocationsIndexPage";

import AssetsIndexPage from "./features/assets/pages/IndexPage";

import AssetViewPage from "./features/assets/pages/ViewPage";

import JobsIndexPage from "./features/jobs/pages/IndexPage";

import JobViewPage from "./features/jobs/pages/ViewPage";

import JobSchedulesIndexPage from "./features/jobSchedules/pages/IndexPage";

import JobScheduleViewPage from "./features/jobSchedules/pages/ViewPage";

import SuppliersIndexPage from "./features/suppliers/pages/IndexPage";

import SupplierViewPage from "./features/suppliers/pages/ViewPage";

import PeopleIndexPage from "./features/people/pages/IndexPage";

import PersonViewPage from "./features/people/pages/ViewPage";

import ReportsIndexPage from "./features/reports/pages/IndexPage";
import DashboardIndexPage from "./features/dashboards/pages/IndexPage";

import SettingsIndexPage from "./features/settings/pages/SettingsIndexPage";
import DataImportPage from "./features/settings/pages/DataImportPage";
import DataCategoriesPage from "./features/settings/pages/DataCategoriesPage";

export default function AppRoutes() {
  return (
    <>
      <Routes>
        {/* Authenticated Routes */}
        <Route element={<AuthenticatedLayout />}>
          <Route path="/locations" element={<LocationsIndexPage />} />

          <Route path="/assets" element={<AssetsIndexPage />} />
          <Route path="/assets/:id" element={<AssetViewPage />} />

          <Route path="/jobs" element={<JobsIndexPage />} />

          <Route path="/jobs/:id" element={<JobViewPage />} />

          <Route path="/job-schedules" element={<JobSchedulesIndexPage />} />

          <Route path="/job-schedules/:id" element={<JobScheduleViewPage />} />

          <Route path="/suppliers" element={<SuppliersIndexPage />} />

          <Route path="/suppliers/:id" element={<SupplierViewPage />} />

          <Route path="/people" element={<PeopleIndexPage />} />

          <Route path="/people/:id" element={<PersonViewPage />} />

          <Route path="/dashboard" element={<DashboardIndexPage />} />
          <Route path="/reports" element={<ReportsIndexPage />} />
          <Route path="/settings" element={<SettingsIndexPage />} />

          <Route path="/update-password" element={<UpdatePasswordPage />} />
          <Route
            path="/settings/data-categories"
            element={<DataCategoriesPage />}
          />
          <Route path="/settings/data-import" element={<DataImportPage />} />
          <Route path="/settings/account" element={<AccountViewPage />} />
        </Route>

        {/* Public Routes - No nav */}

        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </>
  );
}
