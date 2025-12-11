import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { useCreateCategoryMutation } from "../dataCategoriesApi";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import { useToast } from "../../../hooks/useToast";

const DataCategoryModal = ({ showModal, closeModal, categoryType }) => {
  const [createCategory, { isLoading, error }] = useCreateCategoryMutation();
  const toast = useToast();

  const [form, setForm] = useState({
    description: "",
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCategory({ categoryType, data: form }).unwrap();
      toast.success("Category created successfully");
      setForm({
        description: "",
      });
      closeModal();
    } catch (err) {
      toast.error("Failed to create category");
      console.error("Failed to create category:", err);
    }
  };

  return (
    <Dialog
      visible={showModal}
      onHide={closeModal}
      header="Create Category"
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

export default DataCategoryModal;
