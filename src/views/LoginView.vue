<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import CryptoJS from 'crypto-js';

const email = ref('');                                   // 邮箱
const password = ref('');                                // 密码
const loginStatus = ref('');                             // 登录状态
const errorMessage = ref('');                            // 错误信息
const router = useRouter();                              // 路由

const login = async () => {
  loginStatus.value = "clicked";
  errorMessage.value = "";

  if (!process.env.API_URL) {
    console.error('API_URL is not defined');
    alert('未找到环境变量 API_URL');
    return;
  }

  try {
    const encryptedPassword = CryptoJS.SHA256(password.value).toString(); // 对原始密码进行 SHA256 加密
    const response = await axios.post(`${process.env.API_URL}/auth?type=login`, {
      email: email.value,
      password: encryptedPassword
    });
    console.log(response.data);
    loginStatus.value = "success";
    setTimeout(async () => {
      await router.push('/');
    }, 3000); // 等待 3 秒后跳转到主页
  } catch (error) {
    console.error(error);
    loginStatus.value = "failed";
    if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
      errorMessage.value = error.response.data.message;
    } else {
      errorMessage.value = "登录失败";
    }
  }
};
</script>

<template>
  <div>
    <h2>登录</h2>
    <input v-model="email" type="text" placeholder="邮箱" required/><br />
    <input v-model="password" type="password" placeholder="密码" required/><br />
    <button @click="login" :disabled="!email || !password" :class="{ 'disabled': !email || !password || loginStatus == 'clicked' }">登录</button>
    <div v-if="loginStatus == 'clicked'" class="status-clicked">请稍后...</div>
    <div v-if="loginStatus == 'success'" class="status-success">登录成功，3秒后跳转至主页</div>
    <div v-if="loginStatus == 'failed'" class="status-failed">{{ errorMessage }}</div>
  </div>
</template>

<style scoped>
h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

input {
  margin-top: 1rem;
  margin-right: 1rem;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  appearance: textfield;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

button {
  margin-top: 1rem;
  margin-right: 1rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  background-color: hsla(160, 100%, 37%, 1);
  color: white;
  cursor: pointer;
}

button:hover {
  background-color: hsla(158, 49%, 44%, 1);
}

button.disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

div.status-clicked {
  display: inline-block;
  margin-left: 1rem;
}

div.status-success {
  display: inline-block;
  margin-left: 1rem;
  color: hsla(160, 100%, 37%, 1);
}

div.status-failed {
  display: inline-block;
  margin-left: 1rem;
  color: hsla(0, 80%, 65%, 1);
}
</style>
