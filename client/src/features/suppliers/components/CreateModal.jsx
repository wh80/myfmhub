import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { useCreateSupplierMutation } from "../suppliersApi";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import { useToast } from "../../../hooks/useToast";

const SupplierCreateModal = ({ showModal, closeModal }) => {
  const [createSupplier, { isLoading, error }] = useCreateSupplierMutation();

  const toast = useToast();

  const [form, setForm] = useState({
    description: "",
    address: "",
    telephone: "",
    email: "",
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createSupplier(form).unwrap();
      toast.success("Supplier created successfully");
      closeModal();
    } catch (err) {
      toast.error("Failed to create supplier");
      console.error("Failed to create supplier:", err);
    }
  };

  return (
    <Dialog
      visible={showModal}
      onHide={closeModal}
      header="Create Supplier"
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

export default SupplierCreateModal;
