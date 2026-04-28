import http from '@/lib/http/client';

export const uploadRequest = {
  // Upload single image to Cloudinary
  uploadImage: async (file, folder = 'products') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    const res = await http.post('/upload/image', formData);
    return res.data; // returns the Cloudinary URL string
  },

  // Upload multiple images to Cloudinary
  uploadImages: async (files, folder = 'products') => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('folder', folder);
    const res = await http.post('/upload/images', formData);
    return res.data; // returns array of Cloudinary URLs
  },

  // Delete image from Cloudinary
  deleteImage: async (url) => {
    const res = await http.delete('/upload/image', { query: { url } });
    return res.data;
  },
};
