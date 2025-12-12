import { useForgotPasswordMutation } from "../authApi";
import { useState } from "react";
import { useToast } from "../../../hooks/useToast";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Message } from "primereact/message";

const ForgotPasswordPage = () => {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const toast = useToast();

  const [form, setForm] = useState({
    email: "",
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const [formErrors, setFormErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email) {
      setFormErrors({ email: "Email is required." });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setFormErrors({ email: "Please enter a valid email address." });
      return;
    }

    try {
      await forgotPassword(form).unwrap();
      setForm({ email: "" });
      setShowSuccessMsg(true);
    } catch (err) {
      toast.error("Failed to submit request - please try again.");
      console.error("Failed to submit forgot password request:", err);
    }
  };

  return (
    <div className="flex align-items-center justify-content-center min-h-screen surface-ground">
      <div className="w-full px-3" style={{ maxWidth: "28rem" }}>
        <Card>
          {!showSuccessMsg ? (
            <>
              <div className="text-center mb-4">
                <h1 className="text-3xl font-bold text-900 mb-2">
                  Forgot Password
                </h1>
                <p className="text-600 mt-0 mb-0">
                  Enter your email address and we'll send you a link to reset
                  your password.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label htmlFor="email" className="block font-medium mb-2">
                    Email
                  </label>
                  <InputText
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="Enter your email"
                    className={`w-full ${formErrors.email ? "p-invalid" : ""}`}
                  />
                  {formErrors.email && (
                    <small className="p-error block mt-1">
                      {formErrors.email}
                    </small>
                  )}
                </div>

                <Button
                  label="Send Reset Link"
                  type="submit"
                  className="w-full mt-3"
                  loading={isLoading}
                />

                <div className="text-center mt-4">
                  <a
                    href="/login"
                    className="text-primary font-medium no-underline hover:underline"
                  >
                    Back to login
                  </a>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center">
              <i
                className="pi pi-check-circle text-green-500 mb-3"
                style={{ fontSize: "4rem" }}
              ></i>
              <h2 className="text-2xl font-bold text-900 mt-0 mb-3">
                Check Your Email
              </h2>
              <Message
                severity="success"
                text="Your request has been received. If the email provided is associated with an account, a reset link will be sent shortly."
                className="w-full mb-4"
              />
              <Button
                label="Back to Login"
                className="w-full"
                onClick={() => (window.location.href = "/login")}
                outlined
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
