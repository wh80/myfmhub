import { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";
import { useGetAllJobsQuery } from "../../jobs/jobsApi";
import {
  useGetJobsForAssetQuery,
  useLinkAssetToJobsMutation,
  useUnlinkAssetFromJobsMutation,
} from "../assetsApi";
import { PageLoadingState } from "../../../shared/components/PageLoadingState";
import { getMaterialisedPathAsString } from "../../../utils";
import { useToast } from "../../../hooks/useToast";

const AssetJobsTab = ({ assetId }) => {
  const [linkMode, setLinkMode] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const toast = useToast();

  // Mutation to link jobs
  const [linkJobs, { isLoading: linkJobsLoading, error: linkJobsError }] =
    useLinkAssetToJobsMutation();

  // Mutation to unlink jobs
  const [unlinkJobs, { isLoading: unlinkJobsLoading, error: unlinkJobsError }] =
    useUnlinkAssetFromJobsMutation();

  // Load jobs already related to asset
  const {
    data: relatedJobs,
    error: relatedJobsError,
    isLoading: relatedJobsLoading,
  } = useGetJobsForAssetQuery(assetId);

  // Load all jobs when in link mode
  const {
    data: allJobs,
    error: allJobsError,
    isLoading: allJobsLoading,
  } = useGetAllJobsQuery(undefined, { skip: !linkMode });

  const enableLinkMode = () => {
    setLinkMode(true);
  };

  const cancelLinkMode = () => {
    setLinkMode(false);
    setSelectedJobs([]);
  };

  const handleLinkSelected = async () => {
    try {
      const jobIds = selectedJobs.map((job) => job.id);
      await linkJobs({ id: assetId, data: jobIds }).unwrap();
      toast.success("Jobs linked successfully");
      cancelLinkMode();
    } catch (err) {
      toast.error("Failed to link jobs");
      console.error("Failed to link jobs:", err);
    }
  };

  const handleUnlinkSelected = async () => {
    try {
      const jobIds = selectedJobs.map((job) => job.id);
      await unlinkJobs({ id: assetId, data: jobIds }).unwrap();
      toast.success("Jobs unlinked successfully");
      cancelLinkMode();
    } catch (err) {
      toast.error("Failed to unlink jobs");
      console.error("Failed to unlink jobs:", err);
    }
  };

  // Calculate which jobs to show
  const displayJobs = linkMode
    ? allJobs?.filter((job) => !relatedJobs?.some((rj) => rj.id === job.id)) ||
      []
    : relatedJobs || [];

  const actionsBodyTemplate = (rowData) => {
    return (
      <Link to={`/jobs/${rowData.id}`}>
        <i className="pi pi-eye" style={{ fontSize: "1.5rem" }}></i>
      </Link>
    );
  };

  const error =
    relatedJobsError || allJobsError || linkJobsError || unlinkJobsError;

  const isLoading =
    relatedJobsLoading ||
    allJobsLoading ||
    linkJobsLoading ||
    unlinkJobsLoading;

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
              disabled={selectedJobs.length === 0}
              onClick={handleUnlinkSelected}
            />
          </>
        ) : (
          <>
            <Button
              label="Link Selected"
              icon="pi pi-check"
              onClick={handleLinkSelected}
              disabled={selectedJobs.length === 0}
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
          value={displayJobs}
          selection={selectedJobs}
          onSelectionChange={(e) => setSelectedJobs(e.value)}
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
            header="Actions"
            body={actionsBodyTemplate}
            style={{ width: "5rem" }}
          />
        </DataTable>
      )}
    </>
  );
};

export default AssetJobsTab;
