import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { useCreateAssetMutation } from "../assetsApi";
import { useGetAllLocationsQuery } from "../../locations/locationsApi";
import { useGetAllCategoriesQuery } from "../../settings/dataCategoriesApi";
import { PageLoadingState } from "../../../shared/components/PageLoadingState";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { TreeSelect } from "primereact/treeselect";
import { useToast } from "../../../hooks/useToast";
import { Dropdown } from "primereact/dropdown";

const AssetCreateModal = ({
  showModal,
  closeModal,
  locationId = undefined,
}) => {
  const [createAsset, { isLoading, error }] = useCreateAssetMutation();

  const {
    data: locations,
    error: locationsError,
    isLoading: locationsLoading,
  } = useGetAllLocationsQuery();

  const {
    data: categories,
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useGetAllCategoriesQuery("asset-categories");

  const toast = useToast();

  const [form, setForm] = useState({
    description: "",
    address: "",
    telephone: "",
    email: "",
    locationId: locationId,
    categoryId: undefined,
  });

  const [formErrors, setFormErrors] = useState({});

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

    if (!form.locationId) {
      setFormErrors({ locationId: "Location is required." });
      return;
    }

    try {
      await createAsset(form).unwrap();
      toast.success("Asset created successfully");
      handleClose();
    } catch (err) {
      toast.error("Failed to create asset");
      console.error("Failed to create asset:", err);
    }
  };

  const dataLoading = locationsLoading || categoriesLoading;
  const dataError = locationsError || categoriesError;

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

          <div className="grid">
            <div className="col-12 md:col-6">
              <label htmlFor="assetNumber" className="font-semibold block mb-1">
                Asset Number
              </label>
              <InputText
                id="assetNumber"
                value={form.assetNumber}
                onChange={(e) => updateField("assetNumber", e.target.value)}
              />
            </div>

            <div className="col-12 md:col-6">
              <label
                htmlFor="serialNumber"
                className="font-semibold block mb-1"
              >
                Serial Number
              </label>
              <InputText
                id="modserialNumberel"
                value={form.serialNumber}
                onChange={(e) => updateField("serialNumber", e.target.value)}
              />
            </div>
          </div>
          <div className="grid">
            <div className="col-12 md:col-6">
              <label htmlFor="make" className="font-semibold block mb-1">
                Make
              </label>
              <InputText
                id="make"
                value={form.make}
                onChange={(e) => updateField("make", e.target.value)}
              />
            </div>

            <div className="col-12 md:col-6">
              <label htmlFor="model" className="font-semibold block mb-1">
                Model
              </label>
              <InputText
                id="model"
                value={form.model}
                onChange={(e) => updateField("model", e.target.value)}
              />
            </div>
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

export default AssetCreateModal;
