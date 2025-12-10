import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Link } from "react-router-dom";

import { useGetJobsForLocationQuery } from "../../locations/locationsApi";
import { PageLoadingState } from "../../../shared/components/PageLoadingState";
import { getMaterialisedPathAsString } from "../../../utils";

const LocationJobsTab = ({ locationId }) => {
  // Load related assets queries for relevant resource
  const {
    data: relatedJobs,
    error: relatedJobsError,
    isLoading: relatedJobsLoading,
  } = useGetJobsForLocationQuery(locationId, { skip: !locationId });

  const actionsBodyTemplate = (rowData) => {
    return (
      <Link to={`/jobs/${rowData.id}`}>
        <i className="pi pi-eye" style={{ fontSize: "1.5rem" }}></i>
      </Link>
    );
  };

  const jobs = relatedJobs;
  const error = relatedJobsError;
  const isLoading = relatedJobsLoading;

  return (
    <>
      <PageLoadingState isLoading={isLoading} error={error} />

      {jobs && (
        <DataTable value={jobs}>
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

export default LocationJobsTab;
