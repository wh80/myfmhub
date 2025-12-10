import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { useRegisterAccountMutation } from "../accountsApi";

const RegisterPage = () => {
  const [form, setForm] = useState({
    organisation: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const [registerAccount, { isLoading, error, data }] =
    useRegisterAccountMutation();

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await registerAccount(form).unwrap();

      if (result.success) {
        console.log("Navigating");
        navigate("/login");
      }
    } catch (err) {
      console.error("Failed to create account:", err);
    }
  };

  return (
    <div className="flex justify-content-center align-items-center min-h-screen p-3 ">
      <Card
        title="Create an Account"
        style={{ width: "100%", maxWidth: "450px" }}
      >
        <form
          onSubmit={handleSubmit}
          className="p-fluid flex flex-column gap-3"
        >
          <div>
            <label htmlFor="organisation" className="font-semibold block mb-1">
              Organisation Name
            </label>
            <InputText
              id="organisation"
              value={form.organisation}
              onChange={(e) => updateField("organisation", e.target.value)}
            />
          </div>

          <div className="grid">
            <div className="col-12 md:col-6">
              <label htmlFor="firstName" className="font-semibold block mb-1">
                First Name
              </label>
              <InputText
                id="firstName"
                value={form.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
              />
            </div>

            <div className="col-12 md:col-6">
              <label htmlFor="lastName" className="font-semibold block mb-1">
                Last Name
              </label>
              <InputText
                id="lastName"
                value={form.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="font-semibold block mb-1">
              Email
            </label>
            <InputText
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="font-semibold block mb-1">
              Password
            </label>
            <Password
              id="password"
              toggleMask
              feedback={false}
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
            />
          </div>

          <Button label="Register" type="submit" className="mt-3" />

          <p className="text-center mt-3">
            Already have an account?{" "}
            <a href="/login" className="font-medium text-primary">
              Login here
            </a>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default RegisterPage;
