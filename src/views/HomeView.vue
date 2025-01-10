<script setup lang="ts">
const session = getCookie('session') || '';
const nickname = session ? localStorage.getItem('nickname') : '';
</script>

<template>
  <div>
    <h2 v-if="nickname">欢迎，{{ nickname }}</h2>
  </div>
</template>

<style scoped>

</style>
