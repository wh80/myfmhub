import { useState } from "react";
import {
  useGetAccountForUserQuery,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
} from "../accountsApi";
import { useToast } from "../../../hooks/useToast";
import PageTitle from "../../../shared/components/PageTitle";
import { PageLoadingState } from "../../../shared/components/PageLoadingState";
import { useDeleteConfirm } from "../../../hooks/useDeleteConfirm";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

const AccountViewPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const toast = useToast();

  const [updateAccount] = useUpdateAccountMutation();

  const [deleteAccount] = useDeleteAccountMutation();

  const {
    data: account,
    error: accountError,
    isLoading: accountLoading,
  } = useGetAccountForUserQuery();

  const isLoading = accountLoading;
  const error = accountError;
  const confirmDelete = useDeleteConfirm();

  const [form, setForm] = useState({
    description: "",
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = () => {
    // Populate form when entering edit mode
    setForm({
      description: account?.description || "",
    });
    setIsEditing(true);
  };
  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    setForm({
      description: account.description || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateAccount({ data: { ...form } }).unwrap();
      toast.success("Account updated");
      setIsEditing(false);
    } catch (err) {
      toast.error("Failed to update");
      console.error("Failed to update account:", err);
    }
  };

  const handleDelete = async () => {
    console.log("HandleDeleteCalled");
    try {
      await confirmDelete({
        message: `Are you sure you want to delete your account? THIS WILL DELETE ALL ACCOUNT DATA.`,
        header: "Delete Account",
        deleteMutation: deleteAccount,

        redirectUrl: "/register",
      });
    } catch (err) {
      // Cancelled
    }
  };

  // return early as components needs data to show page title
  if (isLoading || error) {
    return <PageLoadingState isLoading={isLoading} error={error} />;
  }

  return (
    <>
      <PageTitle title={account.description} icon="pi pi-building" />

      <div>
        {/* Top bar with edit & delete buttons */}
        <div className="flex justify-content-end gap-2 mb-3">
          {!isEditing ? (
            <>
              <Button
                icon="pi pi-pencil"
                rounded
                text
                severity="info"
                onClick={handleEdit}
                tooltip="Edit"
                tooltipOptions={{ position: "bottom" }}
              />

              <Button
                icon="pi pi-trash"
                rounded
                text
                severity="danger"
                onClick={handleDelete}
                tooltip="Delete"
                tooltipOptions={{ position: "bottom" }}
              />
            </>
          ) : (
            <>
              <Button
                icon="pi pi-check"
                rounded
                text
                severity="success"
                onClick={handleSubmit}
                loading={isLoading}
                tooltip="Save"
                tooltipOptions={{ position: "bottom" }}
              />
              <Button
                icon="pi pi-times"
                rounded
                text
                severity="secondary"
                onClick={handleCancel}
                disabled={isLoading}
                tooltip="Cancel"
                tooltipOptions={{ position: "bottom" }}
              />
            </>
          )}
        </div>

        {/* Content */}
        <form
          onSubmit={handleSubmit}
          className="p-fluid flex flex-column gap-3 lg:w-6 md:w-8 w-full"
        >
          <div>
            <label htmlFor="description" className="font-semibold block mb-1">
              Organisation
            </label>
            {isEditing ? (
              <InputText
                id="description"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
              />
            ) : (
              <p className="m-0">{account.description || "—"}</p>
            )}
          </div>
        </form>
      </div>
    </>
  );
};

export default AccountViewPage;
