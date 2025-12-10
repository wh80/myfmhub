import { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";
import { useGetAllJobSchedulesQuery } from "../../jobSchedules/jobSchedulesApi";
import { formatDateForDisplay } from "../../../utils";
import {
  useGetJobSchedulesForAssetQuery,
  useLinkAssetToJobSchedulesMutation,
  useUnlinkAssetFromJobSchedulesMutation,
} from "../assetsApi";
import { PageLoadingState } from "../../../shared/components/PageLoadingState";
import { getMaterialisedPathAsString } from "../../../utils";
import { useToast } from "../../../hooks/useToast";

const AssetJobSchedulesTab = ({ assetId }) => {
  const [linkMode, setLinkMode] = useState(false);
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const toast = useToast();

  // Mutation to link jobs
  const [
    linkSchedules,
    { isLoading: linkSchedulesLoading, error: linkSchedulesError },
  ] = useLinkAssetToJobSchedulesMutation();

  // Mutation to unlink jobs
  const [
    unlinkSchedules,
    { isLoading: unlinkSchedulesLoading, error: unlinkSchedulesError },
  ] = useUnlinkAssetFromJobSchedulesMutation();

  // Load schedules already related to asset
  const {
    data: relatedSchedules,
    error: relatedSchedulesError,
    isLoading: relatedSchedulesLoading,
  } = useGetJobSchedulesForAssetQuery(assetId);

  // Load all schedules when in link mode
  const {
    data: allSchedules,
    error: allSchedulesError,
    isLoading: allSchedulesLoading,
  } = useGetAllJobSchedulesQuery(undefined, { skip: !linkMode });

  const enableLinkMode = () => {
    setLinkMode(true);
  };

  const cancelLinkMode = () => {
    setLinkMode(false);
    setSelectedSchedules([]);
  };

  const handleLinkSelected = async () => {
    try {
      const scheduleIds = selectedSchedules.map((schedule) => schedule.id);
      await linkSchedules({ id: assetId, data: scheduleIds }).unwrap();
      toast.success("Job schedules linked successfully");
      cancelLinkMode();
    } catch (err) {
      toast.error("Failed to link jobs");
      console.error("Failed to link jobs:", err);
    }
  };

  const handleUnlinkSelected = async () => {
    try {
      const scheduleIds = selectedSchedules.map((schedule) => schedule.id);
      await unlinkSchedules({ id: assetId, data: scheduleIds }).unwrap();
      toast.success("Job schedules unlinked successfully");
      cancelLinkMode();
    } catch (err) {
      toast.error("Failed to unlink job schedules");
      console.error("Failed to unlink job schedules:", err);
    }
  };

  // Calculate which schedules to show
  const displaySchedules = linkMode
    ? allSchedules?.filter(
        (schedule) => !relatedSchedules?.some((rs) => rs.id === schedule.id)
      ) || []
    : relatedSchedules || [];

  const actionsBodyTemplate = (rowData) => {
    return (
      <Link to={`/job-scheudules/${rowData.id}`}>
        <i className="pi pi-eye" style={{ fontSize: "1.5rem" }}></i>
      </Link>
    );
  };

  const error =
    relatedSchedulesError ||
    allSchedulesError ||
    linkSchedulesError ||
    unlinkSchedulesError;

  const isLoading =
    relatedSchedulesLoading ||
    allSchedulesLoading ||
    linkSchedulesLoading ||
    unlinkSchedulesLoading;

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
              disabled={selectedSchedules.length === 0}
              onClick={handleUnlinkSelected}
            />
          </>
        ) : (
          <>
            <Button
              label="Link Selected"
              icon="pi pi-check"
              onClick={handleLinkSelected}
              disabled={selectedSchedules.length === 0}
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
          value={displaySchedules}
          selection={selectedSchedules}
          onSelectionChange={(e) => setSelectedSchedules(e.value)}
          dataKey="id"
        >
          <Column selectionMode="multiple" />

          <Column field="summary" header="Summary" />

          <Column
            header="Location"
            body={(rowData) =>
              getMaterialisedPathAsString(rowData.location?.materialisedPath)
            }
          />
          <Column
            header="Next Due"
            body={(rowData) => formatDateForDisplay(rowData.nextDue)}
          />

          <Column
            header="Recurrance"
            body={(rowData) =>
              `${rowData.recurrenceInterval} ${rowData.recurrenceUnit}`
            }
          />

          <Column
            header="Compliance"
            body={(rowData) => (
              <div className="flex justify-content-center">
                <i
                  className={
                    rowData.statutoryCompliance
                      ? "pi pi-check text-green-500"
                      : "pi pi-times text-red-500"
                  }
                  style={{ fontSize: "1.2rem" }}
                />
              </div>
            )}
            style={{ width: "8rem", textAlign: "center" }}
          />

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

export default AssetJobSchedulesTab;
