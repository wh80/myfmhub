import { useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import {
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} from "../suppliersApi";
import { useToast } from "../../../hooks/useToast";
import { useDeleteConfirm } from "../../../hooks/useDeleteConfirm";

const SupplierOverviewTab = ({ supplier }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updateSupplier, { isLoading }] = useUpdateSupplierMutation();
  const [deleteSupplier] = useDeleteSupplierMutation();
  const confirmDelete = useDeleteConfirm();

  const toast = useToast();

  const [form, setForm] = useState({
    description: supplier.description || "",
    address: supplier.address || "",
    telephone: supplier.telephone || "",
    email: supplier.email || "",
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = () => {
    // Reset form to current supplier values when entering edit mode
    setForm({
      description: supplier.description || "",
      address: supplier.address || "",
      telephone: supplier.telephone || "",
      email: supplier.email || "",
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    setForm({
      description: supplier.description || "",
      address: supplier.address || "",
      telephone: supplier.telephone || "",
      email: supplier.email || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSupplier({ id: supplier.id, data: { ...form } }).unwrap();
      toast.success("Supplier updated");
      setIsEditing(false);
    } catch (err) {
      toast.error("Failed to update");
      console.error("Failed to update Supplier:", err);
    }
  };

  const handleDelete = async () => {
    console.log("HandleDeleteCalled");
    try {
      await confirmDelete({
        message: `Are you sure you want to delete "${supplier.description}"?`,
        header: "Delete Supplier",
        deleteMutation: deleteSupplier,
        itemId: supplier.id,
        redirectUrl: "/suppliers",
      });
    } catch (err) {
      // Cancelled
    }
  };

  return (
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
            Description
          </label>
          {isEditing ? (
            <InputText
              id="description"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          ) : (
            <p className="m-0">{supplier.description || "—"}</p>
          )}
        </div>

        <div>
          <label htmlFor="address" className="font-semibold block mb-1">
            Address
          </label>
          {isEditing ? (
            <InputTextarea
              id="address"
              rows={5}
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
            />
          ) : (
            <p className="m-0 white-space-pre-line">
              {supplier.address || "—"}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="telephone" className="font-semibold block mb-1">
            Telephone
          </label>
          {isEditing ? (
            <InputText
              id="telephone"
              value={form.telephone}
              onChange={(e) => updateField("telephone", e.target.value)}
            />
          ) : (
            <p className="m-0">{supplier.telephone || "—"}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="font-semibold block mb-1">
            Email
          </label>
          {isEditing ? (
            <InputText
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          ) : (
            <p className="m-0">{supplier.email || "—"}</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default SupplierOverviewTab;
