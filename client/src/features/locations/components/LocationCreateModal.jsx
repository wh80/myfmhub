import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { useCreateLocationMutation } from "../locationsApi";
import { useGetAllCategoriesQuery } from "../../settings/dataCategoriesApi";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useToast } from "../../../hooks/useToast";
import { Dropdown } from "primereact/dropdown";

const LocationCreateModal = ({ showModal, closeModal, parentId }) => {
  const [createLocation, { isLoading, error }] = useCreateLocationMutation();
  const toast = useToast();

  const {
    data: categories,
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useGetAllCategoriesQuery("location-categories");

  const [form, setForm] = useState({
    description: "",
    address: "",
    telephone: "",
    email: "",
    parentId: parentId,
    categoryId: undefined,
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    setForm({
      description: "",
      address: "",
      telephone: "",
      email: "",
      categoryId: undefined,
      locationId: undefined,
    });
    closeModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createLocation(form).unwrap();
      toast.success("Location created successfully");
      handleClose();
    } catch (err) {
      toast.error("Failed to create location");
      console.error("Failed to create Location:", err);
    }
  };

  const dataLoading = categoriesLoading;
  const dataError = categoriesError;

  return (
    <Dialog
      visible={showModal}
      onHide={handleClose}
      header="Create Child Location"
      className="w-11 md:w-6 lg:w-4"
    >
      <form onSubmit={handleSubmit} className="p-fluid flex flex-column gap-3">
        <div>
          <label htmlFor="description" className="font-semibold block mb-1">
            Description
          </label>
          <InputText
            id="description"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
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
          <label htmlFor="address" className="font-semibold block mb-1">
            Address
          </label>
          <InputTextarea
            id="address"
            rows={5}
            value={form.address}
            onChange={(e) => updateField("address", e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="telephone" className="font-semibold block mb-1">
            Telephone
          </label>
          <InputText
            id="telephone"
            value={form.telephone}
            onChange={(e) => updateField("telephone", e.target.value)}
          />
        </div>

        <div>
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

        <Button
          label="Submit"
          type="submit"
          className="mt-3"
          loading={isLoading}
        />
      </form>
    </Dialog>
  );
};

export default LocationCreateModal;
