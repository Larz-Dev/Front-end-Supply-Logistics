import React, { useState } from "react";

import loadingPost from "./assets/images/PostLoading.gif";
const ImageMaximizer = ({ src }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleImageClick = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <img
        src={src}
        className="img-fluid  rounded-3"
        width={250}
        onClick={handleImageClick}
        style={{ cursor: "pointer" }}
        alt="Thumbnail"
      />

      {isOpen && (
        <div className="modal" onClick={handleClose} style={modalStyle}>
          <img src={src} style={imageStyle} alt="Maximized" />
        </div>
      )}
    </>
  );
};

// Estilos para el modal y la imagen maximizada
const modalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const imageStyle = {
  maxWidth: "90%",
  maxHeight: "90%",
};

export default ImageMaximizer;
