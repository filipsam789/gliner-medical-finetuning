import React from "react";
import { Box } from "@mui/material";

export const HeartRate = () => {
  return (
    <Box
      sx={{
        width: "300px", 
        height: "73px",
        position: "relative",
        margin: "10px auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: "scale(1)", 
        transformOrigin: "center",
        overflow: "hidden",
      }}
    >
      <svg
        version="1.0"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        width="300px"
        height="73px"
        viewBox="0 0 300 73"
        enableBackground="new 0 0 300 73"
        xmlSpace="preserve"
      >
        <polyline
          fill="none"
          stroke="#fd556e"
          strokeWidth="3"
          strokeMiterlimit="10"
          points="0,45.486 25,45.486 30,33.324 35,45.486 40,45.486 44,55.622 50,9 56,63.729 60,45.486 75,45.486 80,40.419 85,45.486 100,45.486"
        />
        <polyline
          fill="none"
          stroke="#fd556e"
          strokeWidth="3"
          strokeMiterlimit="10"
          points="100,45.486 125,45.486 130,33.324 135,45.486 140,45.486 144,55.622 150,9 156,63.729 160,45.486 175,45.486 180,40.419 185,45.486 200,45.486"
        />
        <polyline
          fill="none"
          stroke="#fd556e"
          strokeWidth="3"
          strokeMiterlimit="10"
          points="200,45.486 225,45.486 230,33.324 235,45.486 240,45.486 244,55.622 250,9 256,63.729 260,45.486 275,45.486 280,40.419 285,45.486 300,45.486"
        />
      </svg>
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundColor: "hsl(0, 0%, 98%)",
          top: 0,
          right: 0,
          animation: "heartRateIn 2.5s linear infinite",
          "@keyframes heartRateIn": {
            "0%": {
              width: "100%",
            },
            "50%": {
              width: 0,
            },
            "100%": {
              width: 0,
            },
          },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: "120%",
          height: "100%",
          top: 0,
          left: "-120%",
          animation: "heartRateOut 2.5s linear infinite",
          background:
            "linear-gradient(to right, hsl(0, 0%, 98%) 0%, hsl(0, 0%, 98%) 80%, transparent 100%)",
          "@keyframes heartRateOut": {
            "0%": {
              left: "-120%",
            },
            "30%": {
              left: "-120%",
            },
            "100%": {
              left: "0%",
            },
          },
        }}
      />
    </Box>
  );
};
