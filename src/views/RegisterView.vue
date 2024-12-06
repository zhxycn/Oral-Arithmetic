<script setup lang="ts">
import { ref, computed } from 'vue';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { useRouter } from 'vue-router'

const email = ref('');                                   // 邮箱
const nickname = ref('');                                // 昵称
const password = ref('');                                // 密码
const confirmPassword = ref('');                         // 确认密码
const emailSelected = ref(false);                        // [状态]邮箱输入框是否被选中过
const nicknameSelected = ref(false);                     // [状态]昵称输入框是否被选中过
const passwordSelected = ref(false);                     // [状态]密码输入框是否被选中过
const confirmPasswordSelected = ref(false);              // [状态]确认密码输入框是否被选中过
const registerStatus = ref('');                          // 注册状态
const errorMessage = ref('');                            // 错误信息
const router = useRouter();                              // 路由

const isEmailValid = computed(() => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email.value);
});

const hasUpperCase = computed(() => /[A-Z]/.test(password.value));
const hasLowerCase = computed(() => /[a-z]/.test(password.value));
const hasNumber = computed(() => /[0-9]/.test(password.value));
const isPasswordLongEnough = computed(() => password.value.length >= 8);

const isPasswordValid = computed(() => {
  const validCount = [hasUpperCase.value, hasLowerCase.value, hasNumber.value].filter(Boolean).length;
  return validCount >= 2 && isPasswordLongEnough.value;
});

const register = async () => {
  registerStatus.value = "clicked";
  errorMessage.value = "";

  if (!process.env.API_URL) {
    console.error('API_URL is not defined');
    alert('未找到环境变量 API_URL');
    return;
  }

  try {
    const encryptedPassword = CryptoJS.SHA256(password.value).toString(); // 对原始密码进行 SHA256 加密
    const response = await axios.post(`${process.env.API_URL}/auth?type=register`, {
      email: email.value,
      nickname: nickname.value,
      password: encryptedPassword
    });
    console.log(response.data);
    registerStatus.value = "success";
    setTimeout(async () => {
      await router.push('/login');
    }, 3000); // 等待 3 秒后跳转到登录页
  } catch (error) {
    console.error(error);
    registerStatus.value = "failed";
    if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
      errorMessage.value = error.response.data.message;
    } else {
      errorMessage.value = "注册失败";
    }
  }
};
</script>

<template>
  <div>
    <h2>注册</h2>
    <input v-model="email" type="text" placeholder="邮箱" @blur="emailSelected = true" :class="{ 'invalid': emailSelected && ( !isEmailValid || !email ) }" required/><br />
    <input v-model="nickname" type="text" placeholder="昵称" @blur="nicknameSelected = true" :class="{ 'invalid': nicknameSelected && !nickname }" required/><br />
    <div class="password-container">
      <input v-model="password" type="password" placeholder="密码" @blur="passwordSelected = true" :class="{ 'invalid': passwordSelected && ( !isPasswordValid || !password ) }" required/>
      <div class="tooltip">
        <p :class="{ valid: isPasswordLongEnough, invalid: !isPasswordLongEnough }">至少8个字符</p>
        <p :class="{ valid: hasUpperCase, invalid: !hasUpperCase, unnecessary: !hasUpperCase && isPasswordValid }">包含大写字母</p>
        <p :class="{ valid: hasLowerCase, invalid: !hasLowerCase, unnecessary: !hasLowerCase && isPasswordValid }">包含小写字母</p>
        <p :class="{ valid: hasNumber, invalid: !hasNumber, unnecessary: !hasNumber && isPasswordValid }">包含数字</p>
      </div>
    </div><br />
    <input v-model="confirmPassword" type="password" placeholder="再次输入密码" @blur="confirmPasswordSelected = true" :class="{ 'invalid': confirmPasswordSelected && ( !confirmPassword || confirmPassword !== password ) }" required/><br />
    <button @click="register" :disabled="!email || !nickname || !password || !confirmPassword || registerStatus == 'clicked'" :class="{ 'disabled': !email || !nickname || !password || !confirmPassword }">注册</button>
    <div v-if="registerStatus == 'clicked'" class="status-clicked">请稍后...</div>
    <div v-if="registerStatus == 'success'" class="status-success">注册成功，3秒后跳转至登录页</div>
    <div v-if="registerStatus == 'failed'" class="status-failed">{{ errorMessage }}</div>
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

input.invalid {
  border-color: hsla(0, 80%, 65%, 1);
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.password-container {
  position: relative;
  display: inline-block;
}

.tooltip {
  display: none;
  position: absolute;
  top: 0;
  left: 105%;
  width: 130px;
  background-color: hsla(150, 12%, 95%, 90%);
  color: white;
  border-radius: 8px;
  padding: 10px;
  font-size: 0.9rem;
  box-shadow: 0 4px 8px rgba(200, 200, 200, 0.8);
  z-index: 1;
  transition: opacity 0.3s;
  opacity: 0;
}

.password-container:focus-within .tooltip {
  display: block;
  opacity: 1;
}

.tooltip p {
  margin: 0;
}

.valid {
  color: hsla(160, 100%, 37%, 1);
}

.invalid {
  color: hsla(0, 80%, 65%, 1);
}

.unnecessary {
  color: hsla(0, 0%, 40%, 1);
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
