import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { useCreateJobScheduleMutation } from "../jobSchedulesApi";
import { useGetAllLocationsQuery } from "../../locations/locationsApi";
import { useGetAllCategoriesQuery } from "../../settings/dataCategoriesApi";
import { PageLoadingState } from "../../../shared/components/PageLoadingState";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { TreeSelect } from "primereact/treeselect";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { useToast } from "../../../hooks/useToast";

const JobScheduleCreateModal = ({
  showModal,
  closeModal,
  locationId = undefined,
}) => {
  const [createSchedule, { isLoading, error }] = useCreateJobScheduleMutation();

  const {
    data: locations,
    error: locationsError,
    isLoading: locationsLoading,
  } = useGetAllLocationsQuery();

  const {
    data: categories,
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useGetAllCategoriesQuery("jobschedule-categories");

  const {
    data: jobCategories,
    error: jobCategoriesError,
    isLoading: jobCategoriesLoading,
  } = useGetAllCategoriesQuery("job-categories");

  const toast = useToast();

  const [form, setForm] = useState({
    summary: "",
    description: "",
    locationId: null,
    nextDue: null,
    statutoryCompliance: false,
    noticeDays: null,
    recurrenceUnit: null,
    recurrenceInterval: null,
    categoryId: undefined,
    jobCategoryId: undefined,
  });

  const [formErrors, setFormErrors] = useState({});

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    setForm({
      summary: "",
      description: "",
      locationId: null,
      nextDue: null,
      statutoryCompliance: false,
      noticeDays: null,
      recurrenceUnit: null,
      recurrenceInterval: null,
      categoryId: undefined,
      jobCategoryId: undefined,
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
      await createSchedule(form).unwrap();
      toast.success("Job schedule created successfully");
      handleClose();
    } catch (err) {
      toast.error("Failed to create job schedule");
      console.error("Failed to create job schedule:", err);
    }
  };

  // Recurrence interval options
  const recurrenceUnitOptions = [
    { label: "Days", value: "days" },
    { label: "Weeks", value: "weeks" },
    { label: "Months", value: "months" },
    { label: "Years", value: "years" },
  ];

  const dataLoading =
    locationsLoading || categoriesLoading || jobCategoriesLoading;
  const dataError = locationsError || categoriesError || jobCategoriesError;

  return (
    <Dialog
      visible={showModal}
      onHide={handleClose}
      header="Create Job Schedule"
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

          <div>
            <label htmlFor="jobCategoryId" className="font-semibold block mb-1">
              Job Category
            </label>
            <Dropdown
              id="jobCategoryId"
              value={form.jobCategoryId}
              options={jobCategories}
              onChange={(e) => updateField("jobCategoryId", e.value)}
              optionLabel="description"
              optionValue="id"
              placeholder="Select a job category"
              className="w-full mt-2"
              showClear
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="nextDue" className="font-semibold block mb-1">
                Next Due
              </label>
              <Calendar
                id="nextDue"
                value={form.nextDue}
                onChange={(e) => updateField("nextDue", e.value)}
                dateFormat="dd/mm/yy"
                showIcon
                placeholder="Select date"
              />
            </div>

            <div className="flex-1">
              <label htmlFor="noticeDays" className="font-semibold block mb-1">
                Notice Days
              </label>
              <InputNumber
                id="noticeDays"
                value={form.noticeDays}
                onValueChange={(e) => updateField("noticeDays", e.value)}
                min={0}
                placeholder="Enter number of days"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-2">Repeat Every</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <InputNumber
                  id="recurrenceInterval"
                  value={form.recurrenceInterval}
                  onValueChange={(e) =>
                    updateField("recurrenceInterval", e.value)
                  }
                  min={1}
                  placeholder="Number"
                />
              </div>
              <div className="flex-2">
                <Dropdown
                  id="recurrenceUnit"
                  value={form.recurrenceUnit}
                  onChange={(e) => updateField("recurrenceUnit", e.value)}
                  options={recurrenceUnitOptions}
                  placeholder="Select unit"
                />
              </div>
            </div>
          </div>

          <div className="flex align-items-center gap-2">
            <Checkbox
              inputId="statutoryCompliance"
              checked={form.statutoryCompliance}
              onChange={(e) => updateField("statutoryCompliance", e.checked)}
            />
            <label htmlFor="statutoryCompliance" className="font-semibold">
              Statutory Compliance
            </label>
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

export default JobScheduleCreateModal;
