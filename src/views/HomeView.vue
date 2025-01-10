<script setup lang="ts">
import { getCookie } from '@/utils/cookie';

const session = getCookie('session') || '';
const nickname = session ? localStorage.getItem('nickname') : '';
</script>

<template>
  <div>
    <h2 v-if="session">欢迎，{{ nickname }}</h2>
  </div>
</template>

<style scoped>

</style>
