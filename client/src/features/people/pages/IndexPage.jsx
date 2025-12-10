import { useState } from "react";
import { Link } from "react-router-dom";
import PageTitle from "../../../shared/components/PageTitle";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useGetAllPeopleQuery } from "../peopleApi";
import { PageLoadingState } from "../../../shared/components/PageLoadingState";
import PersonCreateModal from "../components/CreateModal";
import { getMaterialisedPathAsString } from "../../../utils";

const PeopleIndexPage = () => {
  const { data: people, error, isLoading } = useGetAllPeopleQuery();

  const [showCreateModal, setShowCreateModal] = useState(false);

  const actionsBodyTemplate = (rowData) => {
    return (
      <Link to={`/people/${rowData.id}`}>
        <i className="pi pi-eye" style={{ fontSize: "1.5rem" }}></i>
      </Link>
    );
  };

  return (
    <>
      <PageTitle
        title="People"
        icon="pi pi-users"
        onCreateClick={() => {
          setShowCreateModal(true);
        }}
      />

      <PageLoadingState isLoading={isLoading} error={error} />

      {showCreateModal && (
        <PersonCreateModal
          showModal={showCreateModal}
          closeModal={() => {
            setShowCreateModal(false);
          }}
        />
      )}
      {people && (
        <DataTable value={people}>
          <Column field="user.firstName" header="First Name" />
          <Column field="user.lastName" header="Last Name" />

          <Column
            header="Location"
            body={(rowData) =>
              getMaterialisedPathAsString(rowData.location?.materialisedPath)
            }
          />

          <Column field="user.email" header="Email" />

          <Column field="user.jobTitle" header="Job Title" />
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

export default PeopleIndexPage;
