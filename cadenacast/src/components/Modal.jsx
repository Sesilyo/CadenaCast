import React from 'react';

const Modal = ({ isOpen, onClose, title, content, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        <p>{content}</p>
        <div className="modal-actions">
          <button onClick={onClose} className="modal-close">Cancel</button>
          <button onClick={onConfirm} className="modal-confirm">Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
