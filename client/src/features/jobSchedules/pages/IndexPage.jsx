import { useState } from "react";
import PageTitle from "../../../shared/components/PageTitle";
import { Link } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useGetAllJobSchedulesQuery } from "../jobSchedulesApi";
import { PageLoadingState } from "../../../shared/components/PageLoadingState";
import JobScheduleCreateModal from "../components/CreateModal";
import {
  getMaterialisedPathAsString,
  formatDateForDisplay,
} from "../../../utils";

const JobSchedulesIndexPage = () => {
  const { data: schedules, error, isLoading } = useGetAllJobSchedulesQuery();

  const [showCreateModal, setShowCreateModal] = useState(false);

  const actionsBodyTemplate = (rowData) => {
    return (
      <Link to={`/job-schedules/${rowData.id}`}>
        <i className="pi pi-eye" style={{ fontSize: "1.5rem" }}></i>
      </Link>
    );
  };

  return (
    <>
      <PageTitle
        title="Job Schedules"
        icon="pi pi-calendar"
        onCreateClick={() => {
          setShowCreateModal(true);
        }}
      />

      <PageLoadingState isLoading={isLoading} error={error} />

      {showCreateModal && (
        <JobScheduleCreateModal
          showModal={showCreateModal}
          closeModal={() => {
            setShowCreateModal(false);
          }}
        />
      )}

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

export default JobSchedulesIndexPage;
