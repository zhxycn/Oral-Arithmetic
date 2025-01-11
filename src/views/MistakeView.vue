<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { getCookie } from '@/utils/cookie'
import { fetchData, postData } from '@/utils/request'

interface MistakeDetail {
  question: string;
  userAnswer: string;
  correctAnswer: number | null;
}

const session = getCookie('session') || '';
const mistake = ref<MistakeDetail[]>([]);                // 错题
const errorMessage = ref('');                            // 错误信息

const fetchMistake = async () => {
  try {
    const mistakeData = await fetchData('/quiz?type=get_mistakes', errorMessage);
    mistake.value = mistakeData.reverse();

    // 存入浏览器存储
    localStorage.setItem('mistake', JSON.stringify(mistakeData));
  } catch (error) {
    console.error('Failed to fetch:', error);
  }
};

const removeMistake = async (index: number) => {
  const removedMistake = mistake.value.splice(index, 1)[0];
  localStorage.setItem('mistake', JSON.stringify(mistake.value));
  await postData('/quiz?type=remove_mistake', removedMistake, errorMessage);
};

onMounted(() => {
  if (session) {
    // 从浏览器存储中加载数据
    mistake.value = JSON.parse(localStorage.getItem('mistake') || '[]');

    // 从服务器加载并刷新本地数据
    fetchMistake();
  }
});
</script>

<template>
  <div class="mistake-container">
    <h2>错题本</h2>
    <div class="mistake-table-wrapper">
      <table class="mistake-table">
        <thead>
          <tr>
            <th>题目</th>
            <th>你的作答</th>
            <th>正确答案</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in mistake" :key="index">
            <td>{{ item.question }}</td>
            <td>{{ item.userAnswer }}</td>
            <td>{{ item.correctAnswer }}</td>
            <td>
              <button class="remove-button" @click="removeMistake(index)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.mistake-container {
  max-width: 800px;
  margin: 1rem auto;
  padding: 1rem;
  border-radius: 8px;
}

.mistake-container h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  text-align: center;
}

.mistake-table-wrapper {
  overflow-x: auto;
}

.mistake-table {
  width: 100%;
  border-collapse: collapse;
}

.mistake-table th, .mistake-table td {
  border: 1px solid #ddd;
  padding: 0.5rem;
}

.mistake-table th {
  background-color: #f2f2f2;
  text-align: center; /* Center the table headers */
}

.mistake-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.mistake-table tr:hover {
  background-color: #ddd;
}

.mistake-table th {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  background-color: rgba(0, 0, 0, 0.4);
  color: white;
}

.mistake-table th:nth-child(2), .mistake-table th:nth-child(3),
.mistake-table td:nth-child(2), .mistake-table td:nth-child(3) {
  width: 20%;
}

.remove-button {
  padding: 0.3rem 0.6rem;
  font-size: 0.9rem;
  border: none;
  border-radius: 4px;
  background-color: hsla(160, 100%, 37%, 1);
  color: white;
  cursor: pointer;
}

.remove-button:hover {
  background-color: hsla(158, 49%, 44%, 1);
}

@media (max-width: 600px) {
  .mistake-container {
    padding: 0.5rem;
  }

  .mistake-container h2 {
    font-size: 1.2rem;
  }

  .mistake-table th, .mistake-table td {
    padding: 0.3rem;
  }

  .remove-button {
    padding: 0.2rem 0.4rem;
    font-size: 0.8rem;
  }
}
</style>
