<template>
  <div class="qa-panel-container">
    <!-- Q&A Module -->
    <div class="qa-module" :style="{ fontSize: fontSizeMap[fontSize] }">
      <div class="qa-header">
        <span class="qa-title">答疑列表</span>
        <div class="qa-actions">
          <button class="qa-ask-button" @click="openQuestionDialog">+ 我要提问</button>
          <button class="qa-close-button" @click="handleClose" title="关闭">×</button>
        </div>
      </div>

      <transition name="expand">
        <div v-if="showQuestionDialog" class="qa-ask-section">
          <div class="qa-form-body">
            <textarea 
              v-model="newQuestion.text" 
              class="qa-form-textarea" 
              placeholder="请输入问题追问4-1000字"
            ></textarea>
            <div class="qa-form-upload">
              <div class="qa-upload-container">
                <div v-for="(img, i) in newQuestion.images" :key="i" class="qa-upload-preview">
                  <img :src="img.url" />
                  <button class="qa-upload-remove" @click="removeNewQuestionImage(i)">×</button>
                </div>
                <div v-if="newQuestion.images.length < 3" class="qa-upload-btn" @click="triggerNewQuestionUpload">
                  <span class="plus-icon">+</span>
                  <input type="file" ref="newQuestionFileInput" @change="handleNewQuestionFileChange" accept=".jpg,.png" style="display:none" multiple>
                </div>
                <div class="qa-upload-hint">最多3张, 图片仅支持.jpg 或 .png<br>大小不超过 5MB</div>
              </div>
            </div>
          </div>
          <div class="qa-form-footer">
            <button class="qa-form-cancel" @click="closeQuestionDialog">取消</button>
            <button class="qa-form-submit" @click="submitQuestion">提交</button>
          </div>
        </div>
      </transition>

      <div class="qa-list">
        <div v-for="(qa, index) in qaList" :key="index" class="qa-item">
          <div class="qa-question">
            <div class="qa-user-avatar"></div>
            <div class="qa-question-content">
              <div class="qa-question-text">{{ qa.question }}</div>
              <div class="qa-question-meta">
                <span class="qa-timestamp">{{ qa.timestamp }}</span>
                <button class="qa-expand-link" @click="toggleQAItem(index)">
                  {{ qa.expanded ? '收起' : '展开' }} >
                </button>
              </div>
            </div>
          </div>

          <div v-if="qa.expanded" class="qa-answer-section">
            <div v-if="qa.answer" class="qa-answer">
              <div class="qa-answer-avatar"></div>
              <div class="qa-answer-content">
                <div class="qa-answer-text">{{ qa.answer }}</div>
                <div class="qa-answer-timestamp">{{ qa.answerTimestamp }}</div>
              </div>
            </div>

            <div class="qa-followup">
              <textarea 
                v-model="qa.followupText" 
                class="qa-followup-input" 
                placeholder="请输入问题追问4-1000字"
              ></textarea>
              <div class="qa-followup-footer">
                <div class="qa-upload-container">
                  <div v-for="(img, i) in qa.followupImages" :key="i" class="qa-upload-preview">
                    <img :src="img.url" />
                    <button class="qa-upload-remove" @click="removeFollowupImage(index, i)">×</button>
                  </div>
                  <div v-if="(qa.followupImages?.length || 0) < 3" class="qa-upload-btn" @click="triggerFollowupUpload(index)">
                    <span class="plus-icon">+</span>
                    <input type="file" :ref="el => setFollowupFileInput(el, index)" @change="(e) => handleFollowupFileChange(e, index)" accept=".jpg,.png" style="display:none" multiple>
                  </div>
                  <div class="qa-upload-hint">最多3张, 图片仅支持.jpg 或 .png<br>大小不超过 5MB</div>
                </div>
                <button class="qa-submit-button" @click="submitFollowup(index)">提交</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  fontSize?: 'small' | 'medium' | 'large' | 'xlarge'
  questionId?: string
}

const props = withDefaults(defineProps<Props>(), {
  fontSize: 'medium'
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

// 字体大小映射
const fontSizeMap = {
  small: '13px',
  medium: '14px',
  large: '16px',
  xlarge: '18px'
}

// Q&A Module State
const showQuestionDialog = ref(false)
const newQuestion = ref({ text: '', images: [] as { file: File, url: string }[] })

interface QAItem {
  question: string
  timestamp: string
  answer: string
  answerTimestamp: string
  expanded: boolean
  followupText: string
  followupImages?: { file: File, url: string }[]
}

const newQuestionFileInput = ref<HTMLInputElement | null>(null)
const followupFileInputs = ref<Record<number, HTMLInputElement>>({})

const setFollowupFileInput = (el: any, index: number) => {
  if (el) followupFileInputs.value[index] = el
}

const qaList = ref<QAItem[]>([
  {
    question: '根据资料(3)中的第0项,指出关键绩效指标的选取方法。为什么公有工作流程分解法,从题干,没有这个方法。',
    timestamp: '2025-04-27 23:12:34',
    answer: '这里问的是关键绩效指标的选取方法,这有问资料1体现的方法,要分辨清楚材料中的回法,一般说追出什么方法,这时候一般是更全部答上的,如果材料中详细介绍了某个核心理论,要求也回了是现现了什么方法,这时候要针对性的回答,您问题和知识是针对性的要求和回答',
    answerTimestamp: '2025-04-28 07:47:46',
    expanded: false,
    followupText: '',
    followupImages: []
  },
  {
    question: '(4)根据资料(3)中的第0项,指出关键绩效指标的选取方法。答案为什么是有的方法,而不是根据资料指出到底采用了哪种方法?答题时怎么区分什么时候只根据资料答其中几题,什么时候只根据资料答其中几题?',
    timestamp: '2025-04-09 21:00:43',
    answer: '',
    answerTimestamp: '',
    expanded: false,
    followupText: '',
    followupImages: []
  }
])

// Q&A Module Functions
function toggleQAItem(index: number) {
  qaList.value[index].expanded = !qaList.value[index].expanded
}

function openQuestionDialog() {
  showQuestionDialog.value = true
  newQuestion.value.text = ''
  newQuestion.value.images = []
}

function closeQuestionDialog() {
  showQuestionDialog.value = false
}

function submitQuestion() {
  if (!newQuestion.value.text.trim()) return
  
  const now = new Date()
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  
  qaList.value.unshift({
    question: newQuestion.value.text,
    timestamp,
    answer: '',
    answerTimestamp: '',
    expanded: false,
    followupText: '',
    followupImages: []
  })
  
  closeQuestionDialog()
}

function submitFollowup(index: number) {
  const followupText = qaList.value[index].followupText.trim()
  if (!followupText) return
  
  // 实际应用中这里会发送到服务器
  // 现在只是清空输入并提示
  qaList.value[index].followupText = ''
  if (qaList.value[index].followupImages) {
    qaList.value[index].followupImages = []
  }
  alert('追问已提交')
}

// File Upload Functions
function triggerNewQuestionUpload() {
  newQuestionFileInput.value?.click()
}

function handleNewQuestionFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files) {
    processFiles(input.files, newQuestion.value.images)
  }
  input.value = ''
}

function removeNewQuestionImage(index: number) {
  newQuestion.value.images.splice(index, 1)
}

function triggerFollowupUpload(index: number) {
  followupFileInputs.value[index]?.click()
}

function handleFollowupFileChange(event: Event, index: number) {
  const input = event.target as HTMLInputElement
  if (!qaList.value[index].followupImages) {
    qaList.value[index].followupImages = []
  }
  if (input.files) {
    processFiles(input.files, qaList.value[index].followupImages!)
  }
  input.value = ''
}

function removeFollowupImage(qaIndex: number, imgIndex: number) {
  qaList.value[qaIndex].followupImages?.splice(imgIndex, 1)
}

function processFiles(files: FileList, targetList: { file: File, url: string }[]) {
  const remainingSlots = 3 - targetList.length
  if (remainingSlots <= 0) return

  Array.from(files).slice(0, remainingSlots).forEach(file => {
    if (file.size > 5 * 1024 * 1024) {
      alert(`文件 ${file.name} 超过 5MB 限制`)
      return
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert(`文件 ${file.name} 格式不支持`)
      return
    }
    
    const url = URL.createObjectURL(file)
    targetList.push({ file, url })
  })
}

function handleClose() {
  emit('close')
}
</script>

<style scoped>
.qa-panel-container {
  width: 100%;
  height: 100%;
  position: relative;
}

/* Q&A Module Styles */
.qa-module {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(17, 24, 39, 0.08);
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.qa-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px 14px 54px;
  background: linear-gradient(90deg, #ff4733 0%, #f8fafb 100%);
  flex-shrink: 0;
}

.qa-title {
    font-size: 20px;
    font-weight: 600;
    color: #ffffff;
    padding-left: 16px;
}

.qa-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.qa-ask-button {
  padding: 6px 16px;
  background: #dc3545;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.qa-ask-button:hover {
  background: #c82333;
}

.qa-close-button {
  position: absolute;
  left: 16px;
  top: 12px;
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  color: black;
  border: 1px solid rgba(53, 122, 189, 0.3);
  border-radius: 50%;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(17, 24, 39, 0.08);
  transition: all 0.2s ease;
  z-index: 10;
}

.qa-close-button:hover {
  background: #f2f6fb;
}

.qa-list {
  padding: 16px;
  background: #f7f9fc;
  overflow-y: auto;
  flex: 1;
}

.qa-item {
  margin-bottom: 12px;
  padding: 12px 16px;
  background: #ffffff;
  border: 1px solid #e6eaef;
  border-radius: 10px;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.qa-item:hover {
  box-shadow: 0 6px 12px rgba(17, 24, 39, 0.06);
  transform: translateY(-1px);
}

.qa-question {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.qa-user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  flex-shrink: 0;
}

.qa-question-content {
  flex: 1;
}

.qa-question-text {
  font-size: inherit;
  line-height: 1.8;
  color: #333;
  margin-bottom: 8px;
  word-break: break-word;
}

.qa-question-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.qa-timestamp {
  font-size: 12px;
  color: #999;
}

.qa-expand-link {
  background: none;
  border: none;
  color: #ff4733;
  font-size: 12px;
  cursor: pointer;
  padding: 0;
  font-weight: 600;
}

.qa-expand-link:hover {
  text-decoration: underline;
}

.qa-answer-section {
  margin-top: 16px;
  padding-left: 52px;
}

.qa-answer {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #eef2f7;
}

.qa-answer-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  flex-shrink: 0;
}

.qa-answer-content {
  flex: 1;
}

.qa-answer-text {
  font-size: inherit;
  line-height: 1.8;
  color: #4b5563;
  margin-bottom: 8px;
  word-break: break-word;
}

.qa-answer-timestamp {
  font-size: 12px;
  color: #999;
}

.qa-followup {
  margin-top: 12px;
}

.qa-followup-input {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: inherit;
  line-height: 1.6;
  resize: vertical;
  font-family: inherit;
}

.qa-followup-input:focus {
  outline: none;
  border-color: #4a90e2;
}

.qa-followup-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.qa-upload-hint {
  font-size: 12px;
  color: #999;
}

.qa-submit-button {
  padding: 6px 24px;
  background: #dc3545;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.qa-submit-button:hover {
  background: #c82333;
}

/* Inline Form Styles */
.qa-ask-section {
  background: #f8fafc;
  border-bottom: 1px solid #e6eaef;
  padding: 16px;
  overflow: hidden;
}

.qa-form-textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 12px;
  background: #ffffff;
}

.qa-form-textarea:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
}

.qa-form-upload {
  margin-bottom: 16px;
}

.qa-form-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.qa-form-cancel {
  padding: 6px 20px;
  background: #ffffff;
  color: #666;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.qa-form-cancel:hover {
  background: #f5f5f5;
  border-color: #d0d0d0;
}

.qa-form-submit {
  padding: 6px 20px;
  background: #dc3545;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.qa-form-submit:hover {
  background: #c82333;
}

/* Transition Animation */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 500px;
  opacity: 1;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

/* Upload Styles */
.qa-upload-container {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.qa-upload-btn {
  width: 50px;
  height: 50px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #fafafa;
  transition: border-color 0.3s;
}

.qa-upload-btn:hover {
  border-color: #4a90e2;
}

.plus-icon {
  font-size: 24px;
  color: #999;
  font-weight: 300;
}

.qa-upload-preview {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  border: 1px solid #e0e0e0;
}

.qa-upload-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.qa-upload-remove {
  position: absolute;
  top: 0;
  right: 0;
  width: 16px;
  height: 16px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qa-upload-hint {
  font-size: 12px;
  color: #999;
  line-height: 1.5;
}
</style>
