import http from '@/lib/http/client';

export const aiRequest = {
  extractPrescription: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await http.post('/prescription-ai/extract', formData);
    return response;
  },
  chatPrescription: async (message) => {
    const response = await http.post('/prescription-ai/chat', { message });
    return response;
  },
};
