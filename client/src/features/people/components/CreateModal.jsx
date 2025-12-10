import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { useCreatePersonMutation } from "../peopleApi";
import { useGetAllLocationsQuery } from "../../locations/locationsApi";
import { PageLoadingState } from "../../../shared/components/PageLoadingState";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { TreeSelect } from "primereact/treeselect";
import { useToast } from "../../../hooks/useToast";

const PersonCreateModal = ({
  showModal,
  closeModal,
  locationId = undefined,
}) => {
  const [createPerson, { isLoading, error }] = useCreatePersonMutation();

  const {
    data: locations,
    error: locationsError,
    isLoading: locationsLoading,
  } = useGetAllLocationsQuery();

  const toast = useToast();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    locationId: locationId,
    jobTitle: "",
    mobile: "",
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      locationId: locationId,
      jobTitle: "",
      mobile: "",
    });
    closeModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPerson(form).unwrap();
      toast.success("Person created successfully");
      handleClose();
    } catch (err) {
      toast.error("Failed to create person");
      console.error("Failed to create person:", err);
    }
  };

  const dataLoading = locationsLoading;
  const dataError = locationsError;

  return (
    <Dialog
      visible={showModal}
      onHide={handleClose}
      header="Create Asset"
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
          <div className="grid">
            <div className="col-12 md:col-6">
              <label htmlFor="firstName" className="font-semibold block mb-1">
                First Name
              </label>
              <InputText
                id="firstName"
                value={form.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
              />
            </div>

            <div className="col-12 md:col-6">
              <label htmlFor="lastName" className="font-semibold block mb-1">
                Last Name
              </label>
              <InputText
                id="lastName"
                value={form.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
              />
            </div>
          </div>

          <div className="grid">
            <div className="col-12 md:col-6">
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

            <div className="col-12 md:col-6">
              <label htmlFor="jobTitle" className="font-semibold block mb-1">
                Job Title
              </label>
              <InputText
                id="jobTitle"
                type="jobTitle"
                value={form.jobTitle}
                onChange={(e) => updateField("jobTitle", e.target.value)}
              />
            </div>
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

export default PersonCreateModal;
