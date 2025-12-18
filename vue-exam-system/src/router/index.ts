import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Portal',
      component: () => import('@/views/portal/index.vue'),
      meta: { title: '题库管理系统' }
    },
    {
      path: '/student',
      name: 'StudentPortal',
      component: () => import('@/views/student/index.vue'),
      meta: { title: '学员题库系统' }
    },
    {
      path: '/student/exam/:id',
      name: 'StudentExam',
      component: () => import('@/views/student/exam.vue'),
      meta: { title: '在线答题' }
    },
    {
      path: '/student/practice/:id',
      name: 'StudentPractice',
      component: () => import('@/views/student/practice.vue'),
      meta: { title: '练习答题' }
    },
    {
      path: '/student/result/:id',
      name: 'StudentResult',
      component: () => import('@/views/student/exam-records.vue'),
      meta: { title: '答题结果' }
    },
    {
      path: '/student/practice-analysis/:id',
      name: 'StudentPracticeAnalysis',
      component: () => import('@/views/student/practice-analysis.vue'),
      meta: { title: '练习模式·答案解析' }
    },
    {
      path: '/student/exam-analysis/:id',
      name: 'StudentExamAnalysis',
      component: () => import('@/views/student/exam-analysis.vue'),
      meta: { title: '考试模式·答案解析' }
    },
    {
      path: '/student/exam-records',
      name: 'StudentExamRecords',
      component: () => import('@/views/student/exam-records.vue'),
      meta: { title: '答题记录' }
    },
    {
      path: '/student/wrong-questions',
      name: 'StudentWrongQuestions',
      component: () => import('@/views/student/wrong-questions.vue'),
      meta: { title: '我的错题' }
    },
    {
      path: '/student/favorites',
      name: 'StudentFavorites',
      component: () => import('@/views/student/favorites.vue'),
      meta: { title: '我的收藏' }
    },
    {
      path: '/project-management',
      name: 'ProjectManagement',
      component: () => import('@/views/project-management/index.vue'),
      meta: { title: '项目管理' }
    },
    { path: '/category-management', name: 'CategoryManagement', component: () => import('@/views/category-management/index.vue'), meta: { title: '分类管理' } },
    {
      path: '/payment-rule-management',
      name: 'PaymentRuleManagement',
      component: () => import('@/views/payment-rule-management/index.vue'),
      meta: { title: '收费规则管理' }
    },
    {
      path: '/question-type-management',
      name: 'QuestionTypeManagement',
      component: () => import('@/views/question-type-management/index.vue'),
      meta: { title: '题型管理' }
    },
    {
      path: '/question-management',
      name: 'QuestionManagement',
      component: () => import('@/views/question-management/index.vue'),
      meta: { title: '试题管理' }
    },
    {
      path: '/question-management/add',
      name: 'QuestionAdd',
      component: () => import('@/views/question-management/add.vue'),
      meta: { title: '添加试题' }
    },
    {
      path: '/question-management/edit/:id',
      name: 'QuestionEdit',
      component: () => import('@/views/question-management/add.vue'),
      meta: { title: '编辑试题' }
    },
    // 试题分类管理路由（待实现）
    // {
    //   path: '/question-management/category',
    //   name: 'QuestionCategory',
    //   component: () => import('@/views/question-management/category-management.vue'),
    //   meta: { title: '试题分类管理' }
    // },
    {
      path: '/knowledge-point-management',
      name: 'KnowledgePointManagement',
      component: () => import('@/views/knowledge-point-management/index.vue'),
      meta: { title: '知识点管理' }
    },
    {
      path: '/exam-management',
      name: 'ExamManagement',
      component: () => import('@/views/exam-management/index.vue'),
      meta: { title: '试卷管理' }
    },
    {
      path: '/exam-management/create',
      name: 'ExamCreate',
      component: () => import('@/views/exam-management/create.vue'),
      meta: { title: '创建试卷' }
    },
    {
      path: '/exam-management/edit/:id',
      name: 'ExamEdit',
      component: () => import('@/views/exam-management/create.vue'),
      meta: { title: '编辑试卷' }
    },
    {
      path: '/test-management',
      name: 'TestManagement',
      component: () => import('@/views/test-management/index.vue'),
      meta: { title: '考试管理' }
    },
    {
      path: '/test-management/create',
      name: 'TestCreate',
      component: () => import('@/views/test-management/create.vue'),
      meta: { title: '创建考试' }
    },
    {
      path: '/test-management/edit/:id',
      name: 'TestEdit',
      component: () => import('@/views/test-management/create.vue'),
      meta: { title: '编辑考试' }
    },
    {
      path: '/design-guidelines',
      name: 'DesignGuidelines',
      component: () => import('@/views/design-guidelines/index.vue'),
      meta: { title: '设计规范' }
    },
    {
      path: '/marking-management',
      name: 'MarkingManagement',
      component: () => import('@/views/marking-management/index.vue'),
      meta: { title: '阅卷管理' }
    }
  ]
})

export default router
