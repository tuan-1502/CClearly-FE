import { toast } from 'react-toastify';
import { EntityError, HttpError } from './HttpError';

export const handleErrorApi = ({ error, setError }) => {
  if (error instanceof EntityError) {
    if (!setError) return;

    const errors = error.payload.errors;
    if (errors && errors.length > 0) {
      errors.forEach((err) => {
        setError(err.field, { type: 'server', message: err.message });
      });
    }
    return;
  }

  if (error instanceof HttpError) {
    toast.error(error.message);
    return;
  }

  const serverMessage = error?.payload?.message || error?.message;
  if (serverMessage) {
    toast.error(serverMessage);
    return;
  }

  toast.error('Có lỗi không xác định xảy ra');
};
