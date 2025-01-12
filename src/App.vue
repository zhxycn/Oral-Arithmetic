<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ref } from 'vue';
import { getCookie } from '@/utils/cookie';

const session = getCookie('session') || '1';
const nickname = session ? localStorage.getItem('nickname') : '';
const showDropdown = ref(false);
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
      <div v-if="session" class="dropdown" @mouseover="showDropdown = true" @mouseleave="showDropdown = false">
        <RouterLink to="/user" class="nav-link" active-class="active">{{ nickname }}</RouterLink>
        <div v-if="showDropdown" class="dropdown-menu">
          <RouterLink to="/mistake" class="dropdown-item" active-class="active">错题本</RouterLink>
        </div>
      </div>
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

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  z-index: 1000;
  white-space: nowrap;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: var(--color-text);
  display: block;
  transition: background-color 0.3s ease;
}

.dropdown-item:hover {
  background-color: #f0f0f0;
}
</style>
