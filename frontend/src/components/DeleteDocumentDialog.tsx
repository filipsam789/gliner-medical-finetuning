import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

interface DeleteDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  loading: boolean;
}

const DeleteDocumentDialog: React.FC<DeleteDocumentDialogProps> = ({
  open,
  onClose,
  onDelete,
  loading,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Document</DialogTitle>
      <DialogContent>
        <Typography>Do you want to delete this document?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onDelete} color="error" disabled={loading}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDocumentDialog;
