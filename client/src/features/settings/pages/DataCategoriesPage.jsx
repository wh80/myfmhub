import { useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import DataCategoryModal from "../components/DataCategoryModal";
import { useGetAllCategoriesQuery } from "../dataCategoriesApi";

const DataCategoriesPage = () => {
  const [selectedCategoryType, setSelectedCategoryType] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editDescription, setEditDescription] = useState("");

  const {
    data: categories,
    error,
    isLoading,
  } = useGetAllCategoriesQuery(selectedCategoryType, {
    skip: !selectedCategoryType,
  });

  const categoryOptions = [
    { value: "locationCategories", name: "Location Categories" },
    { value: "assetCategories", name: "Asset Categories" },
    { value: "skillCategories", name: "Skill Categories" },
    { value: "jobScheduleCategories", name: "Job Schedule Categories" },
    { value: "fileCategories", name: "File Categories" },
    { value: "jobCategories", name: "Job Categories" },
  ];

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditDescription(item.description);
  };

  const handleUpdate = async (e, id) => {
    e.preventDefault();
    // API call to update - left blank for now
  };

  const handleDelete = async (id) => {
    // API call to delete - left blank for now
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-extrabold mb-4">Data Categories</h1>

      <div className="mb-6">
        <label htmlFor="categoryType" className="block mb-2 font-medium">
          Category
        </label>
        <Dropdown
          id="categoryType"
          value={selectedCategoryType}
          options={categoryOptions}
          onChange={(e) => setSelectedCategoryType(e.value)}
          optionLabel="name"
          optionValue="value"
          placeholder="Select a category"
          className="w-full mt-2"
        />
      </div>

      {selectedCategoryType && (
        <>
          <Button onClick={toggleModal}>Create</Button>
          {categories ? (
            <div className="border border-gray-200 rounded-lg divide-y">
              {categories.map((item) => (
                <div key={item.id} className="p-4">
                  {editingId === item.id ? (
                    <form
                      onSubmit={(e) => handleUpdate(e, item.id)}
                      className="flex gap-2 w-full"
                    >
                      <InputText
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="flex-1"
                      />
                      <Button label="Save" type="submit" size="small" />
                      <Button
                        label="Cancel"
                        type="button"
                        severity="secondary"
                        size="small"
                        onClick={() => setEditingId(null)}
                      />
                    </form>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span>{item.description}</span>
                      <div className="flex gap-2">
                        <i
                          className="pi pi-pencil text-blue-500 cursor-pointer"
                          onClick={() => startEdit(item)}
                        />

                        <i
                          className="pi pi-trash text-red-500 cursor-pointer"
                          onClick={() => handleDelete(item.id)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No categories of this type created yet.</p>
          )}
        </>
      )}

      <DataCategoryModal
        showModal={showModal}
        closeModal={() => setShowModal(false)}
        categoryType={selectedCategoryType}
      />
    </div>
  );
};

export default DataCategoriesPage;
