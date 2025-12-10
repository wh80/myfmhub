import { useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { TreeSelect } from "primereact/treeselect";
import { getMaterialisedPathAsString } from "../../../utils";
import { useUpdateAssetMutation, useDeleteAssetMutation } from "../assetsApi";
import { useToast } from "../../../hooks/useToast";
import { useDeleteConfirm } from "../../../hooks/useDeleteConfirm";
import { useGetAllLocationsQuery } from "../../locations/locationsApi";
import { PageLoadingState } from "../../../shared/components/PageLoadingState";

const AssetOverviewTab = ({ asset }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updateAsset, { isLoading }] = useUpdateAssetMutation();
  const [deleteAsset] = useDeleteAssetMutation();
  const confirmDelete = useDeleteConfirm();

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
    description: asset.description || "",
    locationId: asset.locationId || "",
    assetNumber: asset.assetNumber || "",
    make: asset.make || "",
    model: asset.model || "",
    serialNumber: asset.serialNumber || "",
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = () => {
    // Reset form to current asset values when entering edit mode
    setForm({
      description: asset.description || "",
      locationId: asset.locationId || "",
      assetNumber: asset.assetNumber || "",
      make: asset.make || "",
      model: asset.model || "",
      serialNumber: asset.serialNumber || "",
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    setForm({
      description: asset.description || "",
      locationId: asset.locationId || "",
      assetNumber: asset.assetNumber || "",
      make: asset.make || "",
      model: asset.model || "",
      serialNumber: asset.serialNumber || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateAsset({ id: asset.id, data: { ...form } }).unwrap();
      toast.success("Asset updated");
      setIsEditing(false);
    } catch (err) {
      toast.error("Failed to update");
      console.error("Failed to update Asset:", err);
    }
  };

  const handleDelete = async () => {
    console.log("HandleDeleteCalled");
    try {
      await confirmDelete({
        message: `Are you sure you want to delete "${asset.description}"?`,
        header: "Delete Asset",
        deleteMutation: deleteAsset,
        itemId: asset.id,
        redirectUrl: "/assets",
      });
    } catch (err) {
      // Cancelled
    }
  };

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
          <label htmlFor="description" className="font-semibold block mb-1">
            Description
          </label>
          {isEditing ? (
            <InputText
              id="description"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          ) : (
            <p className="m-0">{asset.description || "—"}</p>
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
              {getMaterialisedPathAsString(asset.location.materialisedPath) ||
                "—"}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="assetNumber" className="font-semibold block mb-1">
            Asset Number
          </label>
          {isEditing ? (
            <InputText
              id="assetNumber"
              value={form.assetNumber}
              onChange={(e) => updateField("assetNumber", e.target.value)}
            />
          ) : (
            <p className="m-0">{asset.assetNumber || "—"}</p>
          )}
        </div>

        <div>
          <label htmlFor="make" className="font-semibold block mb-1">
            Make
          </label>
          {isEditing ? (
            <InputText
              id="make"
              value={form.make}
              onChange={(e) => updateField("make", e.target.value)}
            />
          ) : (
            <p className="m-0">{asset.make || "—"}</p>
          )}
        </div>

        <div>
          <label htmlFor="model" className="font-semibold block mb-1">
            Model
          </label>
          {isEditing ? (
            <InputText
              id="model"
              value={form.model}
              onChange={(e) => updateField("model", e.target.value)}
            />
          ) : (
            <p className="m-0">{asset.model || "—"}</p>
          )}
        </div>

        <div>
          <label htmlFor="serialNumber" className="font-semibold block mb-1">
            Serial Number
          </label>
          {isEditing ? (
            <InputText
              id="serialNumber"
              value={form.serialNumber}
              onChange={(e) => updateField("serialNumber", e.target.value)}
            />
          ) : (
            <p className="m-0">{asset.serialNumber || "—"}</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default AssetOverviewTab;
