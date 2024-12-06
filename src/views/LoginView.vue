<script setup lang="ts">
import { ref } from 'vue';

const email = ref('');
const password = ref('');

const login = () => {
  // 登录
};
</script>

<template>
  <h2>登录</h2>
  <div>
    <input v-model="email" type="text" placeholder="邮箱" required/><br />
    <input v-model="password" type="password" placeholder="密码" required/><br />
    <button @click="login">登录</button>
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
</style>
