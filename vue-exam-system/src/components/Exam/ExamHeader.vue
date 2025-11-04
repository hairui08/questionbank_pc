<template>
  <header class="exam-header">
    <!-- 左侧：公司Logo -->
    <div class="logo-section">
      <div class="brand-logo">领</div>
      <span class="brand-text">领匠教育</span>
    </div>

    <!-- 中间：导航链接 -->
    <nav class="nav-links">
      <router-link to="/student" class="nav-link">我的课程</router-link>
      <router-link to="/student" class="nav-link">评审服务</router-link>
    </nav>

    <!-- 右侧：学习中心和用户信息 -->
    <div class="user-section">
      <router-link to="/student" class="learning-center-link">学习中心</router-link>
      <div class="user-avatar">领</div>
    </div>
  </header>
</template>

<script setup lang="ts">
// 无需响应式数据，纯展示组件
</script>

<style scoped>
.exam-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 32px;
  background: #ffffff;
  border-bottom: 1px solid #e4eaf2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* 左侧Logo区域 */
.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #ff8a3d 0%, #ff5545 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(255, 111, 60, 0.25);
}

.brand-text {
  font-size: 16px;
  font-weight: 600;
  color: #ff5c3c;
}

/* 中间导航链接 */
.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
  flex: 1;
  justify-content: center;
}

.nav-link {
  position: relative;
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: var(--brand-primary, #ff6f3c);
  background: rgba(255, 111, 60, 0.08);
}

.nav-link.router-link-active {
  color: var(--brand-primary, #ff6f3c);
  font-weight: 600;
}

/* 右侧用户区域 */
.user-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.learning-center-link {
  font-size: 13px;
  font-weight: 500;
  color: #333333;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.learning-center-link:hover {
  color: var(--brand-primary, #ff6f3c);
  background: rgba(255, 111, 60, 0.08);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #ff8060 0%, #ff4c3b 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 111, 60, 0.25);
  transition: all 0.2s ease;
}

.user-avatar:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 111, 60, 0.3);
}
</style>
