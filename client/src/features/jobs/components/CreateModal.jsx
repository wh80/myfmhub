import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { useCreateJobMutation } from "../jobsApi";
import { useGetAllLocationsQuery } from "../../locations/locationsApi";
import { useGetAllCategoriesQuery } from "../../settings/dataCategoriesApi";
import { PageLoadingState } from "../../../shared/components/PageLoadingState";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { TreeSelect } from "primereact/treeselect";
import { useToast } from "../../../hooks/useToast";
import { Dropdown } from "primereact/dropdown";

const JobCreateModal = ({ showModal, closeModal, locationId = undefined }) => {
  const [createJob, { isLoading, error }] = useCreateJobMutation();

  const {
    data: locations,
    error: locationsError,
    isLoading: locationsLoading,
  } = useGetAllLocationsQuery();

  const {
    data: categories,
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useGetAllCategoriesQuery("job-categories");

  const toast = useToast();

  const [form, setForm] = useState({
    summary: "",
    description: "",
    locationId: locationId,
    categoryId: undefined,
  });

  const [formErrors, setFormErrors] = useState({});

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    setForm({
      summary: "",
      description: "",
      locationId: locationId,
      categoryId: undefined,
    });
    closeModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.locationId) {
      setFormErrors({ locationId: "Location is required." });
      return;
    }

    try {
      await createJob(form).unwrap();
      toast.success("Job created successfully");
      handleClose();
    } catch (err) {
      toast.error("Failed to create job");
      console.error("Failed to create job:", err);
    }
  };

  const dataLoading = locationsLoading || categoriesLoading;
  const dataError = locationsError || categoriesError;

  return (
    <Dialog
      visible={showModal}
      onHide={handleClose}
      header="Create Job"
      className="w-11 md:w-6 lg:w-4"
    >
      <PageLoadingState
        isLoading={dataLoading}
        error={dataError}
        errorMessage={"Error loading required data."}
      />

      {!dataLoading && (
        <form
          onSubmit={handleSubmit}
          className="p-fluid flex flex-column gap-3"
        >
          <div>
            <label htmlFor="summary" className="font-semibold block mb-1">
              Summary
            </label>
            <InputText
              id="summary"
              value={form.summary}
              onChange={(e) => updateField("summary", e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="description" className="font-semibold block mb-1">
              Description
            </label>
            <InputTextarea
              id="description"
              rows={5}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="locationId" className="font-semibold block mb-1">
              Location
            </label>
            <TreeSelect
              id="locationId"
              value={form.locationId}
              onChange={(e) => updateField("locationId", e.value)}
              options={locations}
              filter
              placeholder="Select a location"
              showClear
            />
            {formErrors.locationId && (
              <small className="p-error">{formErrors.locationId}</small>
            )}
          </div>

          <div>
            <label htmlFor="categoryId" className="font-semibold block mb-1">
              Category
            </label>
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
          </div>

          <Button
            label="Submit"
            type="submit"
            className="mt-3"
            loading={isLoading}
          />
        </form>
      )}
    </Dialog>
  );
};

export default JobCreateModal;
