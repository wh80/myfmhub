import { useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import {
  useUpdateLocationMutation,
  useDeleteLocationMutation,
} from "../locationsApi";
import { useToast } from "../../../hooks/useToast";
import { useDeleteConfirm } from "../../../hooks/useDeleteConfirm";
import { Dropdown } from "primereact/dropdown";
import { useGetAllCategoriesQuery } from "../../settings/dataCategoriesApi";
import { PageLoadingState } from "../../../shared/components/PageLoadingState";

const LocationOverviewTab = ({ location, closeViewPanel }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updateLocation, { isLoading }] = useUpdateLocationMutation();
  const [deleteLocation] = useDeleteLocationMutation();
  const confirmDelete = useDeleteConfirm();

  // Only load categories for select when editing
  const {
    data: categories,
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useGetAllCategoriesQuery("location-categories", {
    skip: !isEditing,
  });

  const toast = useToast();

  const [form, setForm] = useState({
    description: location.description || "",
    address: location.address || "",
    telephone: location.telephone || "",
    email: location.email || "",
    categoryId: location.categoryId || "",
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = () => {
    // Reset form to current location values when entering edit mode
    setForm({
      description: location.description || "",
      address: location.address || "",
      telephone: location.telephone || "",
      email: location.email || "",
      categoryId: location.categoryId || "",
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    setForm({
      description: location.description || "",
      address: location.address || "",
      telephone: location.telephone || "",
      email: location.email || "",
      categoryId: location.categoryId || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(form);
    try {
      await updateLocation({ id: location.id, data: { ...form } }).unwrap();
      toast.success("Location updated");
      setIsEditing(false);
    } catch (err) {
      toast.error("Failed to update");
      console.error("Failed to update Location:", err);
    }
  };

  const handleDelete = async () => {
    console.log("HandleDeleteCalled");
    try {
      await confirmDelete({
        message: `Are you sure you want to delete "${location.description}"?`,
        header: "Delete Location",
        deleteMutation: deleteLocation,
        itemId: location.id,
        onSuccess: closeViewPanel,
      });
    } catch (err) {
      // Cancelled
    }
  };

  const dataLoading = categoriesLoading;
  const dataError = categoriesError;

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
            {/* Do not allow deleting root location */}
            {location.parentId && (
              <Button
                icon="pi pi-trash"
                rounded
                text
                severity="danger"
                onClick={handleDelete}
                tooltip="Delete"
                tooltipOptions={{ position: "bottom" }}
              />
            )}
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

      {/* Loading state for loading locations on edit */}
      <PageLoadingState
        isLoading={dataLoading}
        error={dataError}
        errorMessage={"Error loading required data."}
      />

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
            <p className="m-0">{location.description || "—"}</p>
          )}
        </div>

        <div>
          <label htmlFor="categoryId" className="font-semibold block mb-1">
            Category
          </label>
          {isEditing && !isLoading ? (
            <Dropdown
              id="categoryId"
              value={form.categoryId}
              options={categories}
              onChange={(e) => updateField("categoryId", e.value)}
              optionLabel="description"
              optionValue="id"
              placeholder="Select a category"
              className="w-full mt-2"
              showClear
            />
          ) : (
            <p className="m-0">{location.category?.description || "—"}</p>
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
              {location.address || "—"}
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
            <p className="m-0">{location.telephone || "—"}</p>
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
            <p className="m-0">{location.email || "—"}</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LocationOverviewTab;
