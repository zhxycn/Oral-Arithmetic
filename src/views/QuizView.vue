<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

import { postData, fetchData } from '@/utils/request';

interface QuestionDetail {
  question: string;
  userAnswer: string;
  correctAnswer: number | null;
  isCorrect: boolean;
}

interface MistakeDetail {
  question: string;
  userAnswer: string;
  correctAnswer: number | null;
}

const question = ref('');                                // 拼接后的问题
const userAnswer = ref('');                              // 用户输入的答案
const correctAnswer = ref<number | null>(null);          // 正确答案
const feedback = ref('');                                // 回答正确或错误的反馈信息
const started = ref(false);                              // [状态]是否开始
const answered = ref(false);                             // [状态]是否提交作答
const stopped = ref(false);                              // [状态]是否答题停止
const startTime = ref<number | null>(null);              // 开始时的时间
const elapsedTime = ref(0);                              // 累计用时
const timeLimit = [15 * 60 * 1000, 3 * 60 * 1000];       // 时间限制（模式）
const selectedTimeLimit = ref(timeLimit[0]);             // 选择的时间限制（模式）
const questionCount = ref(0);                            // 回答的总题数
const correctCount = ref(0);                             // 回答正确的题数
const score = ref(0);                                    // 得分
const questionsDetails = ref<QuestionDetail[]>([]);      // 题目存储
const mistake = ref<MistakeDetail[]>([]);                // 错题
const isMistake = ref(false);                            // [状态]是否为错题
const errorMessage = ref('');                            // 错误信息
let timer: ReturnType<typeof setInterval> | null = null; // 计时器

const generateQuestion = () => {
  if (mistake.value.length > 0) {
    const mistakeQuestion = mistake.value.pop();
    if (mistakeQuestion) {
      isMistake.value = true;
      question.value = mistakeQuestion.question;
      correctAnswer.value = Number(mistakeQuestion.correctAnswer);
      userAnswer.value = '';
      feedback.value = '';
      answered.value = false;
      return;
    }
  }

  let num1;
  let num2;
  const operations = ['+', '-', '*', '/'];
  let operation = operations[Math.floor(Math.random() * operations.length)]; // 随机四则运算

  switch (operation) {
    case '+':
      do {
        num1 = Math.floor(Math.random() * 100);
        num2 = Math.floor(Math.random() * 100);
      } while (num1 + num2 > 100);
      correctAnswer.value = num1 + num2;
      break;
    case '-':
      num1 = Math.floor(Math.random() * 100);
      num2 = Math.floor(Math.random() * 100);
      if (num1 < num2) [num1, num2] = [num2, num1];
      correctAnswer.value = num1 - num2;
      break;
    case '*':
      do {
        num1 = Math.floor(Math.random() * 20); // 限制范围
        num2 = Math.floor(Math.random() * 20);
      } while (num1 * num2 > 100);
      correctAnswer.value = num1 * num2;
      operation = '×'; // 乘号
      break;
    case '/':
      do {
        num2 = Math.floor(Math.random() * 20) + 1; // 除数不为 0
        correctAnswer.value = Math.floor(Math.random() * 20);
      } while (num2 * correctAnswer.value > 100);
      num1 = correctAnswer.value * num2;
      operation = '÷'; // 除号
      break;
  }

  question.value = `${num1} ${operation} ${num2}`; // 拼接问题
  isMistake.value = false;
  userAnswer.value = '';
  feedback.value = '';
  answered.value = false;
};

const startQuiz = async () => {
  started.value = true;
  stopped.value = false;
  startTime.value = Date.now();
  elapsedTime.value = 0;
  questionCount.value = 0;
  correctCount.value = 0;
  questionsDetails.value = [];
  mistake.value = [];

  try {
    const data = await fetchData('/quiz?type=get_mistakes', errorMessage);
    if (data) {
      mistake.value = data;
    }
  } catch (error) {
    console.error('Failed to fetch:', error);
  }

  generateQuestion();
  timer = setInterval(() => {
    if (startTime.value !== null) {
      elapsedTime.value = Date.now() - startTime.value;
      if (elapsedTime.value >= selectedTimeLimit.value) { // 超时判断
        stopQuiz();
      }
    }
  }, 10); // 每 0.01 秒更新一次
};

const stopQuiz = () => {
  started.value = false;
  stopped.value = true;
  if (timer !== null) {
    clearInterval(timer); // 清除计时器
  }
  if (selectedTimeLimit.value === timeLimit[0]) {
    score.value = Math.round((correctCount.value / 30) * 75) + Math.round((1 - (elapsedTime.value / selectedTimeLimit.value)) * 25);
  }
  if (selectedTimeLimit.value === timeLimit[1]) {
    score.value = Math.round(correctCount.value * 100);
  }
  if (isNaN(score.value)) { // 一道题都不做怎么能行呀
    score.value = 0;
  }
  uploadSummary()
};

const checkAnswer = () => {
  if (parseFloat(userAnswer.value) === correctAnswer.value) {
    feedback.value = '做对啦!';
    correctCount.value++;
    if (isMistake.value) {
      removeMistake({
        question: question.value,
        userAnswer: userAnswer.value,
        correctAnswer: correctAnswer.value,
        isCorrect: true
      });
    }
  } else {
    feedback.value = `再想想呢...正确答案是 ${correctAnswer.value} 哦`;
    if (!isMistake.value) {
      uploadMistake({
        question: question.value,
        userAnswer: userAnswer.value,
        correctAnswer: correctAnswer.value,
        isCorrect: false
      });
    }
  }
  answered.value = true;
  questionCount.value++;

  questionsDetails.value.push({
    question: question.value,
    userAnswer: userAnswer.value,
    correctAnswer: correctAnswer.value,
    isCorrect: parseFloat(userAnswer.value) === correctAnswer.value
  });

  if (selectedTimeLimit.value === timeLimit[0] && (elapsedTime.value >= selectedTimeLimit.value || questionCount.value >= 30)) {
    stopQuiz();
  }
  if (selectedTimeLimit.value === timeLimit[1] && elapsedTime.value >= selectedTimeLimit.value) {
    stopQuiz();
  }
};

const switchTimeLimit = () => {
  selectedTimeLimit.value = selectedTimeLimit.value === timeLimit[0] ? timeLimit[1] : timeLimit[0];
};

const getQuizSummary = () => {
  const mode = selectedTimeLimit.value === timeLimit[0] ? 'quantity' : 'time';

  return {
    questions: questionsDetails.value,
    correctCount: correctCount.value,
    questionCount: questionCount.value,
    startTime: startTime.value,
    elapsedTime: elapsedTime.value,
    score: score.value,
    mode: mode
  };
};

const downloadSummary = () => {
  const quizSummary = getQuizSummary();
  const json = JSON.stringify(quizSummary, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'summary.json';
  a.click();

  URL.revokeObjectURL(url);
};

const uploadMistake = async (questionDetail: QuestionDetail) => {
  await postData('/quiz?type=save_mistake', questionDetail, errorMessage);
};

const removeMistake = async (questionDetail: QuestionDetail) => {
  await postData('/quiz?type=remove_mistake', questionDetail, errorMessage);
};

const uploadSummary = async () => {
  const quizSummary = getQuizSummary();
  await postData('/quiz?type=save_quiz', quizSummary, errorMessage);
};

const handleKeyup = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !isNaN(parseFloat(userAnswer.value))) {
    if (!answered.value) {
      checkAnswer();
    } else {
      generateQuestion();
    }
  }
};

onMounted(() => {
  document.addEventListener('keyup', handleKeyup);
});

onUnmounted(() => {
  document.removeEventListener('keyup', handleKeyup);
  if (timer !== null) {
    clearInterval(timer); // 清除计时器
  }
});
</script>

<template>
  <h2>练习</h2>
  <div>
    <div class="switch-container">
      <span>模式:</span>
      <span :class="{ 'highlight': selectedTimeLimit === timeLimit[0] }">按数量</span>
      <label class="switch">
        <input type="checkbox" @change="switchTimeLimit" :checked="selectedTimeLimit === timeLimit[1]" :disabled="started"/>
        <span class="slider"></span>
      </label>
      <span :class="{ 'highlight': selectedTimeLimit === timeLimit[1] }">按时间</span>
    </div>
    <div class="info-container">
      <div class="counter-container">
        <span v-if="started || stopped">已做</span>
        <span v-if="started || stopped" class="counter">{{ questionCount }}</span>
        <span v-if="started || stopped">题</span>
        <span v-if="started || stopped">正确</span>
        <span v-if="started || stopped" class="counter">{{ correctCount }}</span>
        <span v-if="started || stopped">题</span>
      </div>
      <div class="timer-container">
        <span v-if="started || stopped" class="timer">{{ (elapsedTime / 1000).toFixed(2) }}</span>
        <span v-if="started || stopped">秒</span>
      </div>
    </div>
    <div v-if="stopped" class="score-container">
      <span v-if="stopped">得分:</span>
      <span v-if="stopped" class="score">{{ score }}</span>
      <span v-if="stopped">分</span>
    </div>
    <button v-if="stopped" @click="downloadSummary">下载数据</button>
    <button v-if="!started" @click="startQuiz">开始</button>
    <div v-else>
      <p class="question">{{ question }}<span v-if="isMistake" class="mistake-label">本题来自错题本</span></p>
      <input v-model="userAnswer" type="number" placeholder="输入你的答案" :disabled="answered" />
      <button @click="checkAnswer" :disabled="isNaN(parseFloat(userAnswer)) || answered" :class="{ 'disabled': isNaN(parseFloat(userAnswer)) || answered }">提交</button>
      <p>{{ feedback }}</p>
      <button v-if="answered" @click="generateQuestion">下一题</button>
    </div>
  </div>
</template>

<style scoped>
h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

input {
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

p {
  margin-top: 1rem;
  font-size: 1rem;
}

p.question {
  margin-top: 1rem;
  font-size: 1.8rem;
}

.mistake-label {
  margin-left: 2rem;
  font-size: 0.9rem;
  color: hsl(0, 100%, 79%);
}

.info-container {
  display: flex;
  align-items: center;
  height: 3rem;
  max-width: 30rem;
  justify-content: flex-end;
}

.switch-container {
  display: flex;
  align-items: center;
}

.switch-container span {
  margin: 0 3px;
  font-size: 0.8rem;
}

.switch-container .highlight {
  color: hsla(160, 100%, 37%, 1);
}

.counter-container {
  display: flex;
  align-items: center;
}

.counter-container span {
  margin: 0 3px;
  font-size: 0.8rem;
}

.counter-container .counter {
  margin-bottom: 5px;
  font-size: 1.5rem;
}

.timer-container {
  width: 7rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.timer-container span {
  margin: 0 3px;
  font-size: 0.8rem;
}

.timer-container .timer {
  margin-bottom: 5px;
  font-size: 1.5rem;
}

.score-container {
  height: 3rem;
  display: flex;
  align-items: center;
}

.score-container span {
  margin-right: 6px;
  font-size: 1.3rem;
}

.score-container .score {
  margin-bottom: 6px;
  font-size: 2.2rem;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 25px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 25px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 19px;
  width: 19px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider:before {
  transform: translateX(18px);
}
</style>
