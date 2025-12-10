import { useContext } from "react";
import { DeleteConfirmContext } from "../contexts/DeleteConfirmContext";

export const useDeleteConfirm = () => {
  const context = useContext(DeleteConfirmContext);

  if (!context) {
    throw new Error(
      "useDeleteConfirm must be used within DeleteConfirmProvider"
    );
  }

  return context.confirmDelete;
};
