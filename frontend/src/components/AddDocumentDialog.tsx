import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

interface AddDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (title: string, text: string, imageUrl?: string) => void;
  loading: boolean;
}

const AddDocumentDialog: React.FC<AddDocumentDialogProps> = ({
  open,
  onClose,
  onAdd,
  loading,
}) => {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleAdd = () => {
    onAdd(title, text, imageUrl || undefined);
    setTitle("");
    setText("");
    setImageUrl("");
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Document</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Text"
          fullWidth
          multiline
          minRows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Image URL (optional)"
          fullWidth
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Leave empty for random image"
          helperText="Enter a URL to a custom image, or leave empty to use a random image"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleAdd}
          disabled={loading || !title.trim() || !text.trim()}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddDocumentDialog;
