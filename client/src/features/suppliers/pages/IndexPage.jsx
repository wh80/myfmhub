import { useState } from "react";
import { Link } from "react-router-dom";
import PageTitle from "../../../shared/components/PageTitle";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useGetAllSuppliersQuery } from "../suppliersApi";
import { PageLoadingState } from "../../../shared/components/PageLoadingState";
import SupplierCreateModal from "../components/CreateModal";

const SuppliersIndexPage = () => {
  const { data: suppliers, error, isLoading } = useGetAllSuppliersQuery();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const actionsBodyTemplate = (rowData) => {
    return (
      <Link to={`/suppliers/${rowData.id}`}>
        <i className="pi pi-eye" style={{ fontSize: "1.5rem" }}></i>
      </Link>
    );
  };

  return (
    <>
      <PageTitle
        title="Suppliers"
        icon="pi pi-warehouse"
        onCreateClick={() => {
          setShowCreateModal(true);
        }}
      />

      <PageLoadingState isLoading={isLoading} error={error} />

      {showCreateModal && (
        <SupplierCreateModal
          showModal={showCreateModal}
          closeModal={() => {
            setShowCreateModal(false);
          }}
        />
      )}

      {suppliers && (
        <>
          <DataTable value={suppliers}>
            <Column field="description" header="Description" />
            <Column field="address" header="Address" />
            <Column field="email" header="Email" />
            <Column field="telephone" header="Telephone" />
            <Column
              header="Actions"
              body={actionsBodyTemplate}
              style={{ width: "5rem" }}
            />
          </DataTable>
        </>
      )}
    </>
  );
};

export default SuppliersIndexPage;
