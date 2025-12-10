import { useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { TreeSelect } from "primereact/treeselect";
import { useGetAllLocationsQuery } from "../../locations/locationsApi";
import { PageLoadingState } from "../../../shared/components/PageLoadingState";
import { getMaterialisedPathAsString } from "../../../utils";
import { useUpdatePersonMutation, useDeletePersonMutation } from "../peopleApi";
import { useToast } from "../../../hooks/useToast";
import { useDeleteConfirm } from "../../../hooks/useDeleteConfirm";

const PersonOverviewTab = ({ person }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updatePerson, { isLoading }] = useUpdatePersonMutation();
  const [deletePerson] = useDeletePersonMutation();
  const confirmDelete = useDeleteConfirm();

  // Only load locations for select when editing
  const {
    data: locations,
    error: locationsError,
    isLoading: locationsLoading,
  } = useGetAllLocationsQuery(undefined, {
    skip: !isEditing,
  });

  const toast = useToast();

  const [form, setForm] = useState({
    locationId: person.locationId,
    firstName: person.user.firstName || "",
    lastName: person.user.lastName || "",
    email: person.user.email || "",
    jobTitle: person.user.jobTitle || "",
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = () => {
    // Reset form to current person values when entering edit mode
    setForm({
      locationId: person.locationId,
      firstName: person.user.firstName || "",
      lastName: person.user.lastName || "",
      email: person.user.email || "",
      jobTitle: person.user.jobTitle || "",
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    setForm({
      locationId: person.locationId,
      firstName: person.user.firstName || "",
      lastName: person.user.lastName || "",
      email: person.user.email || "",
      jobTitle: person.user.jobTitle || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updatePerson({ id: person.id, data: { ...form } }).unwrap();
      toast.success("Person updated");
      setIsEditing(false);
    } catch (err) {
      toast.error("Failed to update");
      console.error("Failed to update Person:", err);
    }
  };

  const handleDelete = async () => {
    console.log("HandleDeleteCalled");
    try {
      await confirmDelete({
        message: `Are you sure you want to delete "${person.firstName} ${person.lastName}"?`,
        header: "Delete Person",
        deleteMutation: deletePerson,
        itemId: person.id,
        redirectUrl: "/people",
      });
    } catch (err) {
      // Cancelled
    }
  };

  const dataLoading = locationsLoading;
  const dataError = locationsError;

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
          <label htmlFor="firstName" className="font-semibold block mb-1">
            First Name
          </label>
          {isEditing ? (
            <InputText
              id="firstName"
              value={form.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
            />
          ) : (
            <p className="m-0">{person.user.firstName || "—"}</p>
          )}
        </div>
        <div>
          <label htmlFor="lastName" className="font-semibold block mb-1">
            Last Name
          </label>
          {isEditing ? (
            <InputText
              id="lastName"
              value={form.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
            />
          ) : (
            <p className="m-0">{person.user.lastName || "—"}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="font-semibold block mb-1">
            Location
          </label>
          {isEditing && !isLoading ? (
            <TreeSelect
              id="locationId"
              value={form.locationId}
              onChange={(e) => updateField("locationId", e.value)}
              options={locations}
              filter
              placeholder="Select a location"
              showClear
            />
          ) : (
            <p className="m-0">
              {getMaterialisedPathAsString(person.location.materialisedPath) ||
                "—"}
            </p>
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
            <p className="m-0">{person.user.email || "—"}</p>
          )}
        </div>

        <div>
          <label htmlFor="jobTitle" className="font-semibold block mb-1">
            Job Title
          </label>
          {isEditing ? (
            <InputText
              id="jobTitle"
              value={form.jobTitle}
              onChange={(e) => updateField("jobTitle", e.target.value)}
            />
          ) : (
            <p className="m-0">{person.user.jobTitle || "—"}</p>
          )}
        </div>

        <div>
          <label htmlFor="mobile" className="font-semibold block mb-1">
            Mobile
          </label>
          {isEditing ? (
            <InputText
              id="mobile"
              value={form.mobile}
              onChange={(e) => updateField("mobile", e.target.value)}
            />
          ) : (
            <p className="m-0">{person.user.mobile || "—"}</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default PersonOverviewTab;
