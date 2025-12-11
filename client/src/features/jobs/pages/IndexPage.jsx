import { useState } from "react";
import { Link } from "react-router-dom";
import PageTitle from "../../../shared/components/PageTitle";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useGetAllJobsQuery } from "../jobsApi";
import { PageLoadingState } from "../../../shared/components/PageLoadingState";
import JobCreateModal from "../components/CreateModal";
import { getMaterialisedPathAsString } from "../../../utils";

const JobsIndexPage = () => {
  const { data: jobs, error, isLoading } = useGetAllJobsQuery();

  const [showCreateModal, setShowCreateModal] = useState(false);

  const actionsBodyTemplate = (rowData) => {
    return (
      <Link to={`/jobs/${rowData.id}`}>
        <i className="pi pi-eye" style={{ fontSize: "1.5rem" }}></i>
      </Link>
    );
  };

  return (
    <>
      <PageTitle
        title="Jobs"
        icon="pi pi-briefcase"
        onCreateClick={() => {
          setShowCreateModal(true);
        }}
      />

      <PageLoadingState isLoading={isLoading} error={error} />

      {showCreateModal && (
        <JobCreateModal
          showModal={showCreateModal}
          closeModal={() => {
            setShowCreateModal(false);
          }}
        />
      )}
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
            header="Category"
            body={(rowData) => rowData.category?.description}
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

export default JobsIndexPage;
