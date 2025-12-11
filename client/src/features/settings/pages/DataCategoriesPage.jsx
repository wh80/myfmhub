import { useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { PageLoadingState } from "../../../shared/components/PageLoadingState";
import DataCategoryModal from "../components/DataCategoryModal";
import {
  useGetAllCategoriesQuery,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from "../dataCategoriesApi";
import { useToast } from "../../../hooks/useToast";
import { useDeleteConfirm } from "../../../hooks/useDeleteConfirm";

const DataCategoriesPage = () => {
  const [selectedCategoryType, setSelectedCategoryType] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const toast = useToast();
  const confirmDelete = useDeleteConfirm();

  const [updateCategory, { isLoading: updateLoading, error: updateError }] =
    useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: deleteLoading, error: deleteError }] =
    useDeleteCategoryMutation();

  const {
    data: categories,
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useGetAllCategoriesQuery(selectedCategoryType, {
    skip: !selectedCategoryType,
  });

  const categoryOptions = [
    { value: "location-categories", name: "Location Categories" },
    { value: "asset-categories", name: "Asset Categories" },
    { value: "skill-categories", name: "Skill Categories" },
    { value: "jobschedule-categories", name: "Job Schedule Categories" },
    { value: "file-categories", name: "File Categories" },
    { value: "job-categories", name: "Job Categories" },
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
    try {
      await updateCategory({
        categoryType: selectedCategoryType,
        data: { description: editDescription },
        id,
      }).unwrap();
      setEditingId(null);
      setEditDescription("");
      toast.success("Category updated successfully");
    } catch (err) {
      toast.error("Failed to update category");
      console.error("Failed to update category:", err);
    }
  };

  const handleDelete = async (id, description) => {
    try {
      await confirmDelete({
        message: `Are you sure you want to delete "${description}"?`,
        header: "Delete Confirmation",
        deleteMutation: deleteCategory,
        deleteParams: { categoryType: selectedCategoryType, id }, // Pass full params object
      });
    } catch (err) {
      toast.error("Failed to delete category");
      console.error("Failed to delete category:", err);
    }
  };

  const isLoading = categoriesLoading || updateLoading || deleteLoading;
  const error = categoriesError || updateError || deleteError;

  return (
    <div className="p-4">
      <ConfirmDialog />
      <h1 className="text-3xl font-extrabold mb-4">Data Categories</h1>

      <PageLoadingState
        isLoading={isLoading}
        error={error}
        errorMessage={"Error loading required data."}
      />

      <div className="mb-6">
        <label htmlFor="categoryType" className="block mb-1 font-medium">
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

      {!isLoading && selectedCategoryType && (
        <>
          <div className="text-right mb-4">
            <Button onClick={toggleModal}>Create</Button>
          </div>

          {categories ? (
            <div className="border border-gray-200 rounded-lg divide-y">
              {categories.map((item) => (
                <div key={item.id} className="px-4 py-2">
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
                      <span className="flex-1">{item.description}</span>
                      <div className="flex gap-2">
                        <Button
                          icon="pi pi-pencil"
                          className="p-button-rounded p-button-text p-button-info"
                          onClick={() => startEdit(item)}
                          aria-label="Edit"
                        />
                        <Button
                          icon="pi pi-trash"
                          className="p-button-rounded p-button-text p-button-danger"
                          onClick={() =>
                            handleDelete(item.id, item.description)
                          }
                          aria-label="Delete"
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
