import React, { useState } from 'react';
import '../styles/AdminControls.css';
import SideNavTab from './SideNavTab.jsx';
import Modal from './Modal.jsx';

const AdminControlsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [actionType, setActionType] = useState('');

  const openModal = (action) => {
    if (action === 'startElection') {
      setModalTitle('START VOTING');
      setModalContent('You are about to start the election process. All eligible voters will be able to cast their votes. Confirm?');
      setActionType('startElection');
    } else if (action === 'pauseVoting') {
      setModalTitle('PAUSE VOTING');
      setModalContent('This will temporarily suspend all voting activity. Voters in the middle of voting will be interrupted. Continue?');
      setActionType('pauseVoting');
    } else if (action === 'endElection') {
      setModalTitle('END ELECTION');
      setModalContent('This will permanently close voting and prepare the system for results calculation. Confirm?');
      setActionType('endElection');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalTitle('');
    setModalContent('');
  };

  const handleConfirm = () => {
    if (actionType === 'startElection') {
      console.log('Starting the election...');
      //placeholder logic
    } else if (actionType === 'pauseVoting') {
      console.log('Pausing the voting...');
      //placeholder logic
    } else if (actionType === 'endElection') {
      console.log('Ending the election...');
      //placeholder logic
    }
    closeModal();
  };

  return (
    <div className="admin-container">
      <div className="sidebar">
        <SideNavTab />
      </div>

      <div className="main">
        <h1>ADMIN CONTROLS</h1>

        <div className="status-banner">
          <strong>STATUS OF ELECTION: </strong>NOT STARTED
        </div>

        <div className="controls">
          <div className="control-card" onClick={() => openModal('startElection')}>
            <div className="icon">▶️</div>
            <h2>START ELECTION</h2>
            <p>Initiate the voting process and open polls to all registered voters.</p>
          </div>

          <div className="control-card" onClick={() => openModal('pauseVoting')}>
            <div className="icon">⏸️</div>
            <h2>PAUSE VOTING</h2>
            <p>Temporarily suspend voting activity for system maintenance.</p>
          </div>

          <div className="control-card" onClick={() => openModal('endElection')}>
            <div className="icon">⏹️</div>
            <h2>END ELECTION</h2>
            <p>Close voting permanently and prepare for results calculation.</p>
          </div>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={modalTitle}
          content={modalContent}
          onConfirm={handleConfirm}
        />
      </div>
    </div>
  );
};

export default AdminControlsPage
