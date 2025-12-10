import { useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { TreeSelect } from "primereact/treeselect";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import {
  useUpdateJobScheduleMutation,
  useDeleteJobScheduleMutation,
} from "../jobSchedulesApi";
import { useToast } from "../../../hooks/useToast";
import { useDeleteConfirm } from "../../../hooks/useDeleteConfirm";
import {
  getMaterialisedPathAsString,
  formatDateForDisplay,
} from "../../../utils";
import { useGetAllLocationsQuery } from "../../locations/locationsApi";
import { PageLoadingState } from "../../../shared/components/PageLoadingState";

const JobScheduleOverviewTab = ({ schedule }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updateJobSchedule, { isLoading }] = useUpdateJobScheduleMutation();
  const [deleteJobSchedule] = useDeleteJobScheduleMutation();
  const confirmDelete = useDeleteConfirm();

  console.log(schedule);

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
    summary: schedule.summary || "",
    description: schedule.description || "",
    locationId: schedule.locationId || "",
    nextDue: schedule.nextDue || "",
    noticeDays: schedule.noticeDays || "",
    recurrenceInterval: schedule.recurrenceInterval || "",
    recurrenceUnit: schedule.recurrenceUnit || "",
    statutoryCompliance: schedule.statutoryCompliance || "",
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = () => {
    // Reset form to current schedule values when entering edit mode
    setForm({
      summary: schedule.summary || "",
      description: schedule.description || "",
      locationId: schedule.locationId || "",
      nextDue: schedule.nextDue || "",
      noticeDays: schedule.noticeDays || "",
      recurrenceInterval: schedule.recurrenceInterval || "",
      recurrenceUnit: schedule.recurrenceUnit || "",
      statutoryCompliance: schedule.statutoryCompliance || "",
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    setForm({
      summary: schedule.summary || "",
      description: schedule.description || "",
      locationId: schedule.locationId || "",
      nextDue: schedule.nextDue || "",
      noticeDays: schedule.noticeDays || "",
      recurrenceInterval: schedule.recurrenceInterval || "",
      recurrenceUnit: schedule.recurrenceUnit || "",
      statutoryCompliance: schedule.statutoryCompliance || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateJobSchedule({ id: schedule.id, data: { ...form } }).unwrap();
      toast.success("Job Schedule updated");
      setIsEditing(false);
    } catch (err) {
      toast.error("Failed to update");
      console.error("Failed to update Job Schedule:", err);
    }
  };

  const handleDelete = async () => {
    console.log("HandleDeleteCalled");
    try {
      await confirmDelete({
        message: `Are you sure you want to delete "${schedule.summary}"?`,
        header: "Delete Job Schedule",
        deleteMutation: deleteJobSchedule,
        itemId: schedule.id,
        redirectUrl: "/job-schedules",
      });
    } catch (err) {
      // Cancelled
    }
  };

  // Recurrence interval options
  const recurrenceUnitOptions = [
    { label: "Days", value: "days" },
    { label: "Weeks", value: "weeks" },
    { label: "Months", value: "months" },
    { label: "Years", value: "years" },
  ];

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
            <p className="m-0">{schedule.summary || "—"}</p>
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
            <p className="m-0">{schedule.description || "—"}</p>
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
              {getMaterialisedPathAsString(
                schedule.location.materialisedPath
              ) || "—"}
            </p>
          )}
        </div>

        <div className="flex-1">
          <label htmlFor="nextDue" className="font-semibold block mb-1">
            Next Due
          </label>
          {isEditing && !isLoading ? (
            <Calendar
              id="nextDue"
              value={form.nextDue ? new Date(form.nextDue) : null}
              onChange={(e) => updateField("nextDue", e.value)}
              dateFormat="dd/mm/yy"
              showIcon
              placeholder="Select date"
            />
          ) : (
            <p className="m-0">
              {formatDateForDisplay(schedule.nextDue) || "—"}
            </p>
          )}
        </div>

        <div className="flex-1">
          <label htmlFor="noticeDays" className="font-semibold block mb-1">
            Notice Days
          </label>
          {isEditing && !isLoading ? (
            <InputNumber
              id="noticeDays"
              value={form.noticeDays}
              onValueChange={(e) => updateField("noticeDays", e.value)}
              min={0}
              placeholder="Enter number of days"
            />
          ) : (
            <p className="m-0">{schedule.noticeDays || "—"}</p>
          )}
        </div>

        <div>
          <label className="font-semibold block mb-2">Repeat Every</label>
          {isEditing && !isLoading ? (
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
          ) : (
            <p className="m-0">{`${schedule.recurrenceInterval} ${schedule.recurrenceUnit} `}</p>
          )}
        </div>

        <div className="flex align-items-center gap-2">
          <label htmlFor="statutoryCompliance" className="font-semibold">
            Statutory Compliance
          </label>
          {isEditing && !isLoading ? (
            <Checkbox
              inputId="statutoryCompliance"
              checked={form.statutoryCompliance}
              onChange={(e) => updateField("statutoryCompliance", e.checked)}
            />
          ) : (
            <i
              className={
                schedule.statutoryCompliance
                  ? "pi pi-check text-green-500"
                  : "pi pi-times text-red-500"
              }
            />
          )}
        </div>
      </form>
    </div>
  );
};

export default JobScheduleOverviewTab;
