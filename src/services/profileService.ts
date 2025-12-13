import api from "./api";
export const uploadProfilePhoto = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/api/profile/photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};