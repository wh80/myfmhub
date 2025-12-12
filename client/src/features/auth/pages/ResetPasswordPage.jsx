import { useResetPasswordMutation } from "../authApi";
import { useState } from "react";
import { useToast } from "../../../hooks/useToast";

import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import { useSearchParams, useNavigate } from "react-router";

const ResetPasswordPage = () => {
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const token = searchParams.get("token");

  const [form, setForm] = useState({
    password: "",
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const [formErrors, setFormErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.password) {
      setFormErrors({ password: "Password is required." });
      return;
    }

    try {
      await resetPassword({ ...form, token }).unwrap();
      setForm({ password: "" });
      toast.success("Password reset");
      navigate("/login");
    } catch (err) {
      toast.error("Failed to submit request - please try again.");
      console.error("Failed to submit reset password request:", err);
    }
  };

  return (
    <div className="flex align-items-center justify-content-center min-h-screen surface-ground p-fluid">
      <div className="w-full px-3" style={{ maxWidth: "28rem" }}>
        <Card>
          {token ? (
            <>
              <div className="text-center mb-4">
                <h1 className="text-3xl font-bold text-900 mb-2">
                  Reset Password
                </h1>
                <p className="text-600 mt-0 mb-0">Enter your new password.</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label htmlFor="password" className="block font-medium mb-2">
                    Password
                  </label>
                  <Password
                    id="password"
                    toggleMask
                    feedback={false}
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    placeholder="Enter your new password"
                  />
                </div>

                <Button
                  label="Submit"
                  type="submit"
                  className="w-full mt-3"
                  loading={isLoading}
                />
              </form>
            </>
          ) : (
            <div className="flex align-items-center justify-content-center min-h-screen surface-ground">
              <div className="w-full px-3" style={{ maxWidth: "28rem" }}>
                <Card>
                  <div className="text-center">
                    <i
                      className="pi pi-exclamation-triangle text-red-500 mb-3"
                      style={{ fontSize: "4rem" }}
                    ></i>
                    <h2 className="text-2xl font-bold text-900 mt-0 mb-3">
                      Invalid Reset Link
                    </h2>
                    <Message
                      severity="error"
                      text="The password reset link is invalid or has expired."
                      className="w-full mb-4"
                    />
                    <Button
                      label="Request New Link"
                      className="w-full"
                      onClick={() => navigate("/forgot-password")}
                    />
                  </div>
                </Card>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
