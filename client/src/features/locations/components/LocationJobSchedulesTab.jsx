import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Link } from "react-router-dom";

import { formatDateForDisplay } from "../../../utils";
import { useGetJobSchedulesForLocationQuery } from "../../locations/locationsApi";
import { PageLoadingState } from "../../../shared/components/PageLoadingState";
import { getMaterialisedPathAsString } from "../../../utils";

const LocationJobSchedulesTab = ({ locationId }) => {
  const {
    data: relatedSchedules,
    error: relatedSchedulesError,
    isLoading: relatedSchedulesLoading,
  } = useGetJobSchedulesForLocationQuery(locationId, { skip: !locationId });

  const actionsBodyTemplate = (rowData) => {
    return (
      <Link to={`/job-scheudules/${rowData.id}`}>
        <i className="pi pi-eye" style={{ fontSize: "1.5rem" }}></i>
      </Link>
    );
  };

  const schedules = relatedSchedules;
  const error = relatedSchedulesError;
  const isLoading = relatedSchedulesLoading;

  return (
    <>
      <PageLoadingState isLoading={isLoading} error={error} />
      {schedules && (
        <DataTable value={schedules}>
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

export default LocationJobSchedulesTab;
