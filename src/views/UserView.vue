<script setup lang="ts">
import { ref, onMounted } from 'vue';

import { getCookie } from '@/utils/cookie';
import { fetchData } from '@/utils/request'

interface MistakeDetail {
  question: string;
  userAnswer: string;
  correctAnswer: number | null;
}

const session = getCookie('session') || '';
const uid = ref('');                                     // 用户 ID
const email = ref('');                                   // 邮箱
const nickname = ref<string | null>(null);               // 昵称
const avatar = ref('');                                  // 头像
const total = ref(0);                                    // 总场次
const competition_total = ref(0);                        // PK 总场次
const competition_win = ref(0);                          // PK 胜场次
const qid = ref<[]>([]);                                 // 测试 ID
const mistake = ref<MistakeDetail[]>([]);                // 错题
const errorMessage = ref('');                            // 错误信息

const fetchUserData = async () => {
  if (!process.env.API_URL) {
    console.error('API_URL is not defined');
    alert('未找到环境变量 API_URL');
    return;
  }

  try {
    const userdata = await fetchData('/user?type=get', errorMessage);
    uid.value = userdata["uid"];
    email.value = userdata["email"];
    nickname.value = userdata["nickname"];
    avatar.value = userdata["avatar"];
    total.value = userdata["total"];
    competition_total.value = userdata["competition_total"];
    competition_win.value = userdata["competition_win"];
    qid.value = userdata["qid"];
    mistake.value = userdata["mistake"];

    // 存入浏览器存储
    localStorage.setItem('uid', userdata["uid"]);
    localStorage.setItem('email', userdata["email"]);
    localStorage.setItem('nickname', userdata["nickname"]);
    localStorage.setItem('avatar', userdata["avatar"]);
    localStorage.setItem('total', userdata["total"].toString());
    localStorage.setItem('competition_total', userdata["competition_total"].toString());
    localStorage.setItem('competition_win', userdata["competition_win"].toString());
    localStorage.setItem('qid', JSON.stringify(userdata["qid"]));
    localStorage.setItem('mistake', JSON.stringify(userdata["mistake"]));
  } catch (error) {
    console.error('Failed to fetch:', error);
  }
};

onMounted(() => {
  if (session) {
    // 从浏览器存储中加载数据
    uid.value = localStorage.getItem('uid') || '';
    email.value = localStorage.getItem('email') || '';
    nickname.value = localStorage.getItem('nickname');
    avatar.value = localStorage.getItem('avatar') || '';
    total.value = parseInt(localStorage.getItem('total') || '0');
    competition_total.value = parseInt(localStorage.getItem('competition_total') || '0');
    competition_win.value = parseInt(localStorage.getItem('competition_win') || '0');
    qid.value = JSON.parse(localStorage.getItem('qid') || '[]');
    mistake.value = JSON.parse(localStorage.getItem('mistake') || '[]');

    // 从服务器加载并刷新本地数据
    fetchUserData();
  }
});
</script>

<template>
  <div class="profile-container">
    <img :src="`${avatar}`" class="profile-avatar" alt=""/>
    <div class="profile-info">
      <h2>欢迎，{{ nickname }}</h2>
      <table class="profile-table">
        <tr>
          <td>UID:</td>
          <td>{{ uid }}</td>
        </tr>
        <tr>
          <td>邮箱:</td>
          <td>{{ email }}</td>
        </tr>
        <tr>
          <td>总场次:</td>
          <td>{{ total }}</td>
        </tr>
        <tr>
          <td>PK 总场次:</td>
          <td>{{ competition_total }}</td>
        </tr>
        <tr>
          <td>PK 胜场次:</td>
          <td>{{ competition_win }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  display: flex;
  align-items: center;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(160, 160, 160, 0.1);
  max-width: 800px;
  margin: 2rem auto;
}

.profile-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin: 0 4rem 0 1rem;
  border: 2px solid #ccc;
}

.profile-info {
  display: flex;
  flex-direction: column;
}

.profile-info h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #333;
}

.profile-table {
  width: 100%;
  border-collapse: collapse;
}

.profile-table td {
  padding: 0.5rem;
  font-size: 1.2rem;
  color: #555;
}

.profile-info strong {
  color: #333;
}

@media (max-width: 600px) {
  .profile-container {
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
  }

  .profile-avatar {
    width: 100px;
    height: 100px;
    margin: 0 auto 1rem auto;
  }

  .profile-info h2 {
    font-size: 1.5rem;
  }

  .profile-table td {
    font-size: 1rem;
  }
}
</style>
