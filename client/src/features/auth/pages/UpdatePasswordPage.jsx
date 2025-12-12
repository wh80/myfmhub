import { useUpdatePasswordMutation } from "../authApi";
import { useState } from "react";
import { useToast } from "../../../hooks/useToast";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Card } from "primereact/card";

const UpdatePasswordPage = () => {
  const [updatePassword, { isLoading }] = useUpdatePasswordMutation();
  const toast = useToast();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const [formErrors, setFormErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.currentPassword) {
      setFormErrors({ currentPassword: "Current password is required." });
      return;
    }

    if (!form.newPassword) {
      setFormErrors({ newPassword: "New password is required." });
      return;
    }

    try {
      await updatePassword({ ...form }).unwrap();
      setForm({ currentPassword: "", newPassword: "" });
      toast.success("Password updated successfully");
    } catch (err) {
      toast.error("Failed to update password - please try again.");
      console.error("Failed to submit update password request:", err);
    }
  };

  return (
    <div className="flex align-items-center justify-content-center min-h-screen surface-ground p-fluid">
      <div className="w-full px-3" style={{ maxWidth: "28rem" }}>
        <Card>
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-900 mb-2">
              Update Password
            </h1>
            <p className="text-600 mt-0 mb-0">
              Enter your current and new passwords.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label
                htmlFor="currentPassword"
                className="block font-medium mb-2"
              >
                Current Password
              </label>
              <Password
                id="currentPassword"
                toggleMask
                feedback={false}
                value={form.currentPassword}
                onChange={(e) => updateField("currentPassword", e.target.value)}
                placeholder="Enter your current password"
              />
            </div>

            <div className="field">
              <label htmlFor="newPassword" className="block font-medium mb-2">
                New Password
              </label>
              <Password
                id="newPassword"
                toggleMask
                feedback={false}
                value={form.newPassword}
                onChange={(e) => updateField("newPassword", e.target.value)}
                placeholder="Enter your new password"
              />
            </div>

            <Button
              label="Update Password"
              type="submit"
              className="w-full mt-3"
              loading={isLoading}
            />
          </form>
        </Card>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;
