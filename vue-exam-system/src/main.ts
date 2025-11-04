import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 导入全局样式
import './assets/styles/variables.css'
import './assets/styles/reset.css'
import './assets/styles/common.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
