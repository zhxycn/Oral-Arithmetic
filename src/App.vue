<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

import { getCookie } from '@/utils/cookie';

const session = getCookie('session') || '';
const nickname = session ? localStorage.getItem('nickname') : '';
</script>

<template>
  <nav>
    <div class="nav-links">
      <RouterLink to="/" class="nav-link" active-class="active">主页</RouterLink>
      <RouterLink to="/quiz" class="nav-link" active-class="active">练习</RouterLink>
      <RouterLink to="/competition" class="nav-link" active-class="active">热座PK</RouterLink>
    </div>
    <div class="auth-links">
      <RouterLink to="/login" class="nav-link" active-class="active" v-if="!session">登录</RouterLink>
      <RouterLink to="/register" class="nav-link" active-class="active" v-if="!session">注册</RouterLink>
      <RouterLink to="/user" class="nav-link" active-class="active" v-if="session">{{ nickname }}</RouterLink>
    </div>
  </nav>

  <h1 class="hidden">小登口算</h1>

  <RouterView />
</template>

<style scoped>
.hidden {
  display: none;
}

nav {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.auth-links {
  display: flex;
  gap: 1rem;
}

.nav-link {
  font-size: 1rem;
  color: var(--color-text);
  text-decoration: none;
  cursor: pointer;
}

.nav-link.active {
  color: hsla(160, 100%, 37%, 1);
}
</style>
