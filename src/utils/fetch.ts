import axios from 'axios';
import { getCookie } from '@/utils/cookie';

const sendRequest = async (method: 'get' | 'post', url: string, data: unknown, errorMessage: { value: string }) => {
  const session = getCookie('session') || '';
  if (!session) return console.info('Not logged in');
  if (!process.env.API_URL) return alert('未找到环境变量 API_URL');

  try {
    const response = await axios({ method, url: `${process.env.API_URL}${url}`, data, withCredentials: true });
    return response.data;
  } catch (error) {
    console.error(error);
    errorMessage.value = axios.isAxiosError(error) && error.response?.data?.message || "请求失败";
  }
};

export const postData = async (url: string, data: unknown, errorMessage: { value: string }) => {
  await sendRequest('post', url, data, errorMessage);
};

export const fetchData = async (url: string, errorMessage: { value: string }) => {
  return await sendRequest('get', url, null, errorMessage);
};
