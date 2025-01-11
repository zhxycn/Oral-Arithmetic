import axios from 'axios';
import { getCookie } from '@/utils/cookie';

export const uploadData = async (url: string, data: unknown, errorMessage: { value: string }) => {
  const session = getCookie('session') || '';

  if (!session) {
    console.info('Not logged in');
    return;
  }

  if (!process.env.API_URL) {
    console.error('API_URL is not defined');
    alert('未找到环境变量 API_URL');
    return;
  }

  try {
    const response = await axios.post(`${process.env.API_URL}${url}`, data, {
      withCredentials: true,
    });
    console.log(response.data);
  } catch (error) {
    console.error(error);
    if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
      errorMessage.value = error.response.data.message;
    } else {
      errorMessage.value = "上传失败";
    }
  }
};
