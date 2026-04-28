import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { uploadRequest } from '@/api/upload';

// Upload single image
export const useUploadImage = () => {
  return useMutation({
    mutationFn: async ({ file, folder }) => {
      return await uploadRequest.uploadImage(file, folder);
    },
    onError: (error) => {
      toast.error('Upload ảnh thất bại: ' + error.message);
    },
  });
};

// Upload multiple images
export const useUploadImages = () => {
  return useMutation({
    mutationFn: async ({ files, folder }) => {
      return await uploadRequest.uploadImages(files, folder);
    },
    onError: (error) => {
      toast.error('Upload ảnh thất bại: ' + error.message);
    },
  });
};

// Delete image
export const useDeleteImage = () => {
  return useMutation({
    mutationFn: async (url) => {
      return await uploadRequest.deleteImage(url);
    },
  });
};
