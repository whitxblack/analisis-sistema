// ============================================
// TecnoInnova S.A. - Confirm Dialog
// ============================================

import { AlertTriangle, Trash2 } from 'lucide-react';
import Modal from './Modal';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, type = 'danger' }) => {
  const Icon = type === 'danger' ? Trash2 : AlertTriangle;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="confirm-dialog">
        <div className={`confirm-icon ${type}`}>
          <Icon size={28} />
        </div>
        <h3 className="confirm-title">{title || '¿Está seguro?'}</h3>
        <p className="confirm-message">{message || 'Esta acción no se puede deshacer.'}</p>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => { onConfirm(); onClose(); }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
