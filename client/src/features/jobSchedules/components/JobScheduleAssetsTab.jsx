import { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Link } from "react-router-dom";
import { Button } from "primereact/button";
import { useGetAllAssetsQuery } from "../../assets/assetsApi";

import {
  useGetAssetsForJobScheduleQuery,
  useLinkJobScheduleToAssetsMutation,
  useUnlinkJobScheduleFromAssetsMutation,
} from "../jobSchedulesApi";

import { PageLoadingState } from "../../../shared/components/PageLoadingState";
import { getMaterialisedPathAsString } from "../../../utils";
import { useToast } from "../../../hooks/useToast";

const JobScheduleAssetsTab = ({ scheduleId }) => {
  const [linkMode, setLinkMode] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const toast = useToast();

  // Mutation to link jobs
  const [linkAssets, { isLoading: linkAssetsLoading, error: linkAssetsError }] =
    useLinkJobScheduleToAssetsMutation();

  // Mutation to unlink jobs
  const [
    unlinkAssets,
    { isLoading: unlinkAssetsLoading, error: unlinkAssetsError },
  ] = useUnlinkJobScheduleFromAssetsMutation();

  // Load assets already related to schedule
  const {
    data: relatedAssets,
    error: relatedAssetsError,
    isLoading: relatedAssetsLoading,
  } = useGetAssetsForJobScheduleQuery(scheduleId);

  // Load all assets when in link mode
  const {
    data: allAssets,
    error: allAssetsError,
    isLoading: allAssetsLoading,
  } = useGetAllAssetsQuery(undefined, { skip: !linkMode });

  const enableLinkMode = () => {
    setLinkMode(true);
  };

  const cancelLinkMode = () => {
    setLinkMode(false);
    setSelectedAssets([]);
  };

  const handleLinkSelected = async () => {
    try {
      const assetIds = selectedAssets.map((asset) => asset.id);
      await linkAssets({ id: scheduleId, data: assetIds }).unwrap();
      toast.success("Assets linked successfully");
      cancelLinkMode();
    } catch (err) {
      toast.error("Failed to link assets");
      console.error("Failed to link assets:", err);
    }
  };

  const handleUnlinkSelected = async () => {
    try {
      const assetIds = selectedAssets.map((asset) => asset.id);
      await unlinkAssets({ id: scheduleId, data: assetIds }).unwrap();
      toast.success("Assets unlinked successfully");
      cancelLinkMode();
    } catch (err) {
      toast.error("Failed to unlink assets");
      console.error("Failed to unlink assets:", err);
    }
  };

  // Calculate which jobs to show
  const displayAssets = linkMode
    ? allAssets?.filter(
        (asset) => !relatedAssets?.some((ra) => ra.id === asset.id)
      ) || []
    : relatedAssets || [];

  const actionsBodyTemplate = (rowData) => {
    return (
      <Link to={`/assets/${rowData.id}`}>
        <i className="pi pi-eye" style={{ fontSize: "1.5rem" }}></i>
      </Link>
    );
  };

  const error =
    relatedAssetsError ||
    allAssetsError ||
    linkAssetsError ||
    unlinkAssetsError;

  const isLoading =
    relatedAssetsLoading ||
    allAssetsLoading ||
    linkAssetsLoading ||
    unlinkAssetsLoading;

  return (
    <>
      <div className="flex justify-content-end gap-2 mb-3">
        {!linkMode ? (
          <>
            <Button label="Link" icon="pi pi-link" onClick={enableLinkMode} />
            <Button
              label="Unlink"
              icon="pi pi-times"
              severity="danger"
              disabled={selectedAssets.length === 0}
              onClick={handleUnlinkSelected}
            />
          </>
        ) : (
          <>
            <Button
              label="Link Selected"
              icon="pi pi-check"
              onClick={handleLinkSelected}
              disabled={selectedAssets.length === 0}
            />
            <Button
              label="Cancel"
              icon="pi pi-times"
              severity="secondary"
              onClick={cancelLinkMode}
            />
          </>
        )}
      </div>

      <PageLoadingState isLoading={isLoading} error={error} />

      {!isLoading && !error && (
        <DataTable
          value={displayAssets}
          selection={selectedAssets}
          onSelectionChange={(e) => setSelectedAssets(e.value)}
          dataKey="id"
        >
          <Column selectionMode="multiple" />
          <Column field="description" header="Description" />
          <Column
            header="Location"
            body={(rowData) =>
              getMaterialisedPathAsString(rowData.location?.materialisedPath)
            }
          />
          <Column field="assetNumber" header="Asset Number" />
          <Column field="serialNumber" header="Serial Number" />
          <Column field="make" header="Make" />
          <Column field="model" header="Model" />

          <Column
            header="Actions"
            body={actionsBodyTemplate}
            style={{ width: "5rem" }}
          />
        </DataTable>
      )}
    </>
  );
};

export default JobScheduleAssetsTab;
