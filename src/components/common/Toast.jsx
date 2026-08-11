// ============================================
// TecnoInnova S.A. - Toast Container
// ============================================

import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const Toast = () => {
  const { toasts, removeToast } = useData();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => {
        const Icon = iconMap[toast.type] || Info;
        return (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <Icon size={18} />
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              className="modal-close"
              onClick={() => removeToast(toast.id)}
              style={{ width: 24, height: 24 }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
