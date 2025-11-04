<template>
  <div class="portal-page">
    <div class="portal-container">
      <!-- 页面标题 -->
      <h1 class="portal-title">题库管理系统</h1>
      <p class="portal-subtitle">欢迎使用题库管理系统</p>

      <!-- 导航按钮 -->
      <div class="portal-buttons">
        <button class="portal-btn admin-btn" @click="navigateToAdmin">
          <span class="btn-icon">🎯</span>
          <span class="btn-text">题库管理后台</span>
          <span class="btn-description">管理题库、试卷、考试等</span>
        </button>

        <button class="portal-btn student-btn" @click="navigateToStudent">
          <span class="btn-icon">📚</span>
          <span class="btn-text">学员题库系统</span>
          <span class="btn-description">参加考试、查看成绩</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// 导航到管理后台
function navigateToAdmin() {
  router.push('/project-management')
}

// 导航到学员系统
function navigateToStudent() {
  router.push('/student')
}
</script>

<style scoped>
/* 全屏容器 */
.portal-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
}

/* 内容容器 */
.portal-container {
  text-align: center;
  max-width: 800px;
  width: 100%;
}

/* 标题 */
.portal-title {
  margin: 0 0 16px;
  font-size: 48px;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  letter-spacing: 2px;
}

/* 副标题 */
.portal-subtitle {
  margin: 0 0 64px;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
}

/* 按钮容器 */
.portal-buttons {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
}

/* 导航按钮基础样式 */
.portal-btn {
  position: relative;
  width: 100%;
  max-width: 500px;
  padding: 32px 40px;
  border: none;
  border-radius: 16px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  overflow: hidden;
}

/* 按钮悬停效果 */
.portal-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

/* 按钮激活效果 */
.portal-btn:active {
  transform: translateY(-2px);
}

/* 管理后台按钮 */
.admin-btn:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.admin-btn:hover .btn-icon,
.admin-btn:hover .btn-text,
.admin-btn:hover .btn-description {
  color: #ffffff;
}

/* 学员系统按钮 */
.student-btn:hover {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.student-btn:hover .btn-icon,
.student-btn:hover .btn-text,
.student-btn:hover .btn-description {
  color: #ffffff;
}

/* 按钮图标 */
.btn-icon {
  font-size: 48px;
  transition: all 0.3s ease;
}

/* 按钮文字 */
.btn-text {
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-text);
  transition: all 0.3s ease;
}

/* 按钮描述 */
.btn-description {
  font-size: 14px;
  color: var(--secondary-text);
  transition: all 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .portal-title {
    font-size: 32px;
  }

  .portal-subtitle {
    font-size: 16px;
    margin-bottom: 48px;
  }

  .portal-btn {
    padding: 24px 32px;
  }

  .btn-icon {
    font-size: 36px;
  }

  .btn-text {
    font-size: 20px;
  }

  .btn-description {
    font-size: 12px;
  }
}
</style>
