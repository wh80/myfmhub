import { useState } from "react";
import {
  useGetAccountOptionsQuery,
  useSetAccountOptionMutation,
} from "../authApi";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../hooks/useToast";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { PageLoadingState } from "../../../shared/components/PageLoadingState";

const AccountSelectionPage = () => {
  const {
    data: accountsData,
    error: accountsError,
    isLoading: accountsLoading,
  } = useGetAccountOptionsQuery();
  const [setAccount, { isLoading: isSettingAccount, error: setAccountError }] =
    useSetAccountOptionMutation();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    accountId: undefined,
  });

  const [formErrors, setFormErrors] = useState({});

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error when user updates field
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Fixed: Check accountId instead of locationId
    if (!form.accountId) {
      setFormErrors({ accountId: "Account is required." });
      return;
    }

    try {
      await setAccount({ accountId: form.accountId }).unwrap();
      toast.success("Account selected successfully");
      navigate("/locations");
    } catch (err) {
      toast.error("Failed to set account");
      console.error("Failed to set account:", err);
    }
  };

  return (
    <>
      <PageLoadingState
        isLoading={accountsLoading}
        error={accountsError}
        errorMessage={"Error loading available accounts."}
      />

      {!accountsLoading && !accountsError && (
        <div
          className="flex align-items-center justify-content-center"
          style={{ minHeight: "100vh" }}
        >
          <div className="surface-card p-4 shadow-2 border-round w-full lg:w-6">
            <div className="text-center mb-5">
              <div className="text-900 text-3xl font-medium mb-3">
                Select Account
              </div>
              <span className="text-600 font-medium line-height-3">
                Choose which account you'd like to access
              </span>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-fluid flex flex-column gap-3"
            >
              <div>
                <label htmlFor="accountId" className="font-semibold block mb-2">
                  Account
                </label>
                <Dropdown
                  id="accountId"
                  value={form.accountId}
                  options={accountsData?.accounts || []}
                  onChange={(e) => updateField("accountId", e.value)}
                  optionLabel="description"
                  optionValue="id"
                  placeholder="Select an account"
                  className={`w-full ${
                    formErrors.accountId ? "p-invalid" : ""
                  }`}
                />
                {formErrors.accountId && (
                  <small className="p-error">{formErrors.accountId}</small>
                )}
              </div>

              <Button
                label="Continue"
                type="submit"
                className="mt-3"
                loading={isSettingAccount}
              />
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AccountSelectionPage;
