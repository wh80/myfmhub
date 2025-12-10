import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { useLoginMutation } from "../authApi";
import { useDispatch } from "react-redux";
import { setUser } from "../authSlice";

const LoginPage = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loginUser, { isLoading, error, data }] = useLoginMutation();

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await loginUser(form).unwrap();
      console.log(result);
      if (result.user) {
        dispatch(setUser(result.user));
        console.log("Navigating to /locations");
        navigate("/locations", { state: { fromLogin: true } });
      }
    } catch (err) {
      console.error("Failed to login:", err);
    }
  };

  return (
    <div className="flex justify-content-center align-items-center min-h-screen p-3">
      <Card title="Login" style={{ width: "100%", maxWidth: "450px" }}>
        <form
          onSubmit={handleSubmit}
          className="p-fluid flex flex-column gap-3"
        >
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

          <Button label="Login" type="submit" className="mt-3" />

          <p className="text-center mt-3">
            Need an account?{" "}
            <a href="/register" className="font-medium text-primary">
              Register here
            </a>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
