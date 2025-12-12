import { createContext, useState } from "react";
import { ConfirmDialog } from "primereact/confirmdialog";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/useToast";

const DeleteConfirmContext = createContext(null);

export default function DeleteConfirmProvider({ children }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState({});

  const confirmDelete = ({
    message = "Are you sure you want to delete this item?",
    header = "Confirm Delete",
    deleteMutation,
    itemId,
    deleteParams, // Allows for adding additional params to API call
    redirectUrl = undefined,
    onSuccess,
  }) => {
    return new Promise((resolve, reject) => {
      const handleAccept = async () => {
        try {
          // If deleteParams is provided, use it; otherwise fall back to just itemId
          const mutationArg = deleteParams || itemId;
          await deleteMutation(mutationArg).unwrap();
          toast.success("Successfully deleted");

          if (onSuccess) {
            onSuccess();
          }

          if (redirectUrl) {
            navigate(redirectUrl);
          }

          setVisible(false);
          resolve();
        } catch (err) {
          toast.error("Failed to delete");
          console.error("Delete failed:", err);
          setVisible(false);
          reject(err);
        }
      };

      const handleReject = () => {
        setVisible(false);
        reject(new Error("Delete cancelled"));
      };

      setConfig({
        message,
        header,
        icon: "pi pi-exclamation-triangle",
        acceptClassName: "p-button-danger",
        accept: handleAccept,
        reject: handleReject,
      });
      setVisible(true);
    });
  };

  return (
    <DeleteConfirmContext.Provider value={{ confirmDelete }}>
      <ConfirmDialog
        visible={visible}
        onHide={() => setVisible(false)}
        {...config}
      />
      {children}
    </DeleteConfirmContext.Provider>
  );
}

export { DeleteConfirmContext };
