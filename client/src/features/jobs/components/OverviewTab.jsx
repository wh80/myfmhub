import { useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { TreeSelect } from "primereact/treeselect";
import { InputTextarea } from "primereact/inputtextarea";
import { useUpdateJobMutation, useDeleteJobMutation } from "../jobsApi";
import { useToast } from "../../../hooks/useToast";
import { useDeleteConfirm } from "../../../hooks/useDeleteConfirm";
import { getMaterialisedPathAsString } from "../../../utils";
import { useGetAllLocationsQuery } from "../../locations/locationsApi";
import { useGetAllCategoriesQuery } from "../../settings/dataCategoriesApi";
import { PageLoadingState } from "../../../shared/components/PageLoadingState";
import { Dropdown } from "primereact/dropdown";

const JobOverviewTab = ({ job }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updateJob, { isLoading }] = useUpdateJobMutation();
  const [deleteJob] = useDeleteJobMutation();
  const confirmDelete = useDeleteConfirm();

  // Only load locations for select when editing
  const {
    data: locations,
    error: locationsError,
    isLoading: locationsLoading,
  } = useGetAllLocationsQuery(undefined, {
    skip: !isEditing,
  });

  // Only load categories for select when editing
  const {
    data: categories,
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useGetAllCategoriesQuery("job-categories", {
    skip: !isEditing,
  });

  const toast = useToast();

  const [form, setForm] = useState({
    summary: job.summary || "",
    description: job.description || "",
    locationId: job.locationId || "",
    categoryId: job.categoryId || "",
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = () => {
    // Reset form to current job values when entering edit mode
    setForm({
      summary: job.summary || "",
      description: job.description || "",
      locationId: job.locationId || "",
      categoryId: job.categoryId || "",
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    setForm({
      summary: job.summary || "",
      description: job.description || "",
      locationId: job.locationId || "",
      categoryId: job.categoryId || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateJob({ id: job.id, data: { ...form } }).unwrap();
      toast.success("Job updated");
      setIsEditing(false);
    } catch (err) {
      toast.error("Failed to update");
      console.error("Failed to update Job:", err);
    }
  };

  const handleDelete = async () => {
    console.log("HandleDeleteCalled");
    try {
      await confirmDelete({
        message: `Are you sure you want to delete "${job.summary}"?`,
        header: "Delete Job",
        deleteMutation: deleteJob,
        itemId: job.id,
        redirectUrl: "/jobs",
      });
    } catch (err) {
      // Cancelled
    }
  };

  const dataLoading = locationsLoading || categoriesLoading;
  const dataError = locationsError || categoriesError;

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
          <label htmlFor="summary" className="font-semibold block mb-1">
            Summary
          </label>
          {isEditing ? (
            <InputText
              id="summary"
              value={form.summary}
              onChange={(e) => updateField("summary", e.target.value)}
            />
          ) : (
            <p className="m-0">{job.summary || "—"}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="font-semibold block mb-1">
            Description
          </label>
          {isEditing ? (
            <InputTextarea
              id="description"
              rows={5}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          ) : (
            <p className="m-0">{job.description || "—"}</p>
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
              {getMaterialisedPathAsString(job.location.materialisedPath) ||
                "—"}
            </p>
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
            <p className="m-0">{job.category?.description || "—"}</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default JobOverviewTab;
