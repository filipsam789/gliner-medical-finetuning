import { Box, Typography } from "@mui/material";
import { getEntityBorderColor, getEntityLabelBgColor } from "../utils/utils";

interface LabelSegmentProps {
  label: string;
}

export const LabelSegment = ({ label }: LabelSegmentProps) => {
  return (
    <Box
      component="span"
      sx={{
        display: "block",
        flex: "1 0 auto",
        width: "100%",
        borderRadius: "0 0 4px 4px",
        backgroundColor: getEntityLabelBgColor(label),
        border: `2px solid ${getEntityBorderColor(label)}`,
        borderTop: "none",
        margin: 0,
        px: 0.5,
        textAlign: "center",
      }}
    >
      <Typography
        component="span"
        sx={{
          fontSize: "10px",
          fontWeight: 700,
          color: "white",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};
