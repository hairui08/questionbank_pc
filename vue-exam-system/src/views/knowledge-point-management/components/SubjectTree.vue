<template>
   <div class="tree-panel-kp">
    <h3>章节导航</h3>
    <div class="search-box">
      <input type="text" placeholder="搜索章节..." class="search-input" v-model="searchKeyword" />
    </div>
    <div class="subject-tree-body">
      <!-- 手动构建树形结构 -->
      <div
        v-for="project in filteredTree"
        :key="project.id"
        class="tree-node"
        :class="{ 'is-expanded': expandedNodes.has(project.id) }"
      >
        <!-- 项目节点 -->
        <div class="tree-node-content" @click="toggleNode(project.id)">
          <span class="arrow">{{ expandedNodes.has(project.id) ? '▼' : '▶' }}</span>
          <span class="node-icon folder"></span>
          <span class="node-label">{{ project.name }}</span>
          <span class="node-count">{{ project.count }}</span>
        </div>
        
        <!-- 科目节点 -->
        <div class="tree-children" v-if="expandedNodes.has(project.id)">
          <div
            v-for="subject in project.children"
            :key="subject.id"
            class="tree-node"
            :class="{ 'is-expanded': expandedNodes.has(subject.id), 'is-active': activeFilter.id === subject.id }"
          >
            <div class="tree-node-content" @click="handleNodeClick(subject, { level: 2 })">
              <span class="arrow" v-if="subject.children && subject.children.length > 0">{{ expandedNodes.has(subject.id) ? '▼' : '▶' }}</span>
              <span class="arrow" v-else></span>
              <span class="node-icon subject"></span>
              <span class="node-label">{{ subject.name }}</span>
              <span class="node-count">{{ subject.count }}</span>
            </div>
            
            <!-- 章节节点 -->
            <div class="tree-children" v-if="expandedNodes.has(subject.id) && subject.children && subject.children.length > 0">
              <div
                v-for="chapter in subject.children"
                :key="chapter.id"
                class="tree-node"
                :class="{ 'is-expanded': expandedNodes.has(chapter.id), 'is-active': activeFilter.id === chapter.id }"
              >
                <div class="tree-node-content" @click="handleNodeClick(chapter, { level: 3 })">
                  <span class="arrow" v-if="chapter.children && chapter.children.length > 0">{{ expandedNodes.has(chapter.id) ? '▼' : '▶' }}</span>
                  <span class="arrow" v-else></span>
                  <span class="node-icon chapter"></span>
                  <span class="node-label">{{ chapter.name }}</span>
                  <span class="node-count">{{ chapter.count }}</span>
                </div>
                
                <!-- 小节节点 -->
                <div class="tree-children" v-if="expandedNodes.has(chapter.id) && chapter.children && chapter.children.length > 0">
                  <div
                    v-for="section in chapter.children"
                    :key="section.id"
                    class="tree-node"
                    :class="{ 'is-active': activeFilter.id === section.id }"
                  >
                    <div class="tree-node-content" @click="handleNodeClick(section, { level: 4 })">
                      <span class="arrow"></span>
                      <span class="node-icon section"></span>
                      <span class="node-label">{{ section.name }}</span>
                      <span class="node-count">{{ section.count }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useChapterStore } from '@/stores/chapter'
import type { ProjectTreeNode } from '@/views/category-management/types'

// Props
const props = defineProps<{
  activeFilter: {
    type: 'subject' | 'chapter' | 'section'
    id: string
    subjectId: string
  }
}>()

// Emits
const emit = defineEmits<{
  'filter-change': [filter: {
    type: 'subject' | 'chapter' | 'section'
    id: string
    subjectId: string
  }]
}>()

// 初始化 store
const chapterStore = useChapterStore()

// 搜索关键词
const searchKeyword = ref('')

// 展开的节点集合
const expandedNodes = ref<Set<string>>(new Set())

// 构建完整的项目-科目-章节-小节树结构
const fullTree = computed(() => {
  return chapterStore.projectTree.map(project => {
    const projectNode = {
      id: project.id,
      name: project.name,
      level: 1,
      count: project.subjects.length,
      children: project.subjects.map(subject => {
        // 获取该科目下所有章节练习类型的章节
        const chapterPracticeChapters = chapterStore.chapters
          .filter(chapter => chapter.subjectId === subject.id && chapter.isChapterPractice)
          .sort((a, b) => a.order - b.order)
        
        // 收集所有章节练习下的小节，直接作为科目节点的子级
        const allSections: any[] = []
        chapterPracticeChapters.forEach(chapter => {
          const chapterSections = chapterStore.sections
            .filter(section => section.chapterId === chapter.id)
            .sort((a, b) => a.order - b.order)
            
          // 直接添加小节到科目子级，跳过章节练习节点
          chapterSections.forEach(section => {
            // 获取该小节下的所有子节（第三级）
            const sectionSubSections = chapterStore.subSections
              .filter(subSection => subSection.sectionId === section.id)
              .sort((a, b) => a.order - b.order)
            
            allSections.push({
              id: section.id,
              name: section.name,
              level: 3, // 小节现在是第三级
              count: sectionSubSections.length,
              children: sectionSubSections.map(subSection => ({
                id: subSection.id,
                name: subSection.name,
                level: 4, // 子节现在是第四级
                count: 0
              }))
            })
          })
        })
        
        const subjectNode = {
          id: subject.id,
          name: subject.name,
          level: 2,
          count: allSections.length,
          children: allSections
        }
        
        return subjectNode
      })
    }
    
    return projectNode
  })
})

// 默认展开第一个项目
watch(
  () => fullTree.value,
  (newTree) => {
    if (newTree.length > 0 && !expandedNodes.value.size) {
      expandedNodes.value.add(newTree[0].id)
    }
  },
  { immediate: true }
)

// 搜索过滤
const filteredTree = computed(() => {
  if (!searchKeyword.value) {
    return fullTree.value
  }
  
  const filterNode = (node: any): boolean => {
    if (node.name.includes(searchKeyword.value)) {
      return true
    }
    if (node.children && node.children.length > 0) {
      return node.children.some((child: any) => filterNode(child))
    }
    return false
  }
  
  const filterTree = (tree: any[]): any[] => {
    return tree.reduce((acc, node) => {
      const filteredNode = { ...node }
      if (filteredNode.children && filteredNode.children.length > 0) {
        filteredNode.children = filterTree(filteredNode.children)
      }
      if (filterNode(filteredNode) || (filteredNode.children && filteredNode.children.length > 0)) {
        acc.push(filteredNode)
      }
      return acc
    }, [] as any[])
  }
  
  return filterTree(fullTree.value)
})

// 切换节点展开/收起
const toggleNode = (nodeId: string) => {
  if (expandedNodes.value.has(nodeId)) {
    expandedNodes.value.delete(nodeId)
  } else {
    expandedNodes.value.add(nodeId)
  }
}

// 节点点击事件
const handleNodeClick = (data: any, node: { level: number }) => {
  let filterType: 'subject' | 'chapter' | 'section' = 'subject'
  let filterId = data.id
  let subjectId = props.activeFilter.subjectId
  
  // 根据节点级别确定筛选类型
  if (node.level === 2) {
    // 科目节点
    filterType = 'subject'
    subjectId = data.id
    toggleNode(data.id) // 切换科目节点展开/收起
  } else if (node.level === 3) {
    // 章节节点
    filterType = 'chapter'
    // 查找对应的科目ID
    const project = fullTree.value.find(p => 
      p.children.some(s => s.children.some(ch => ch.id === data.id))
    )
    if (project) {
      const subject = project.children.find(s => 
        s.children.some(ch => ch.id === data.id)
      )
      if (subject) {
        subjectId = subject.id
      }
    }
    // 确保章节节点展开，不切换收起状态
    expandedNodes.value.add(data.id)
  } else if (node.level === 4) {
    // 小节节点
    filterType = 'section'
    // 查找对应的科目ID和章节ID
    const project = fullTree.value.find(p => 
      p.children.some(s => s.children.some(ch => 
        ch.children.some(sec => sec.id === data.id)
      ))
    )
    if (project) {
      const subject = project.children.find(s => 
        s.children.some(ch => ch.children.some(sec => sec.id === data.id))
      )
      if (subject) {
        subjectId = subject.id
      }
    }
  }
  
  // 发送过滤事件
  emit('filter-change', {
    type: filterType,
    id: filterId,
    subjectId: subjectId
  })
}
</script>

<style scoped>
.tree-panel-kp {
  width: 280px;
  background: #ffffff;
  border: 1px solid #e0e6ed;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tree-panel-kp h3 {
  margin: 0;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-bottom: none;
}

.search-box {
  padding: 10px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.search-input {
  width: 100%;
  padding: 7px 11px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  transition: all 0.2s ease;
  background-color: #ffffff;
}

.search-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.subject-tree-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

/* 树节点基础样式 */
.tree-node {
  margin: 0;
}

.tree-node-content {
  display: flex;
  align-items: center;
  height: 32px;
  line-height: 32px;
  padding: 0 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.tree-node-content:hover {
  background-color: #f5f7fa;
}

.tree-node.is-active > .tree-node-content {
  background-color: #ecf5ff;
  color: #409eff;
}

/* 箭头样式 */
.arrow {
  width: 16px;
  margin-right: 4px;
  font-size: 10px;
  color: #6b7280;
  transition: transform 0.3s ease;
}

/* 图标样式 */
.node-icon {
  margin-right: 8px;
  font-size: 14px;
}

.node-icon.folder::before {
  content: "📁";
}

.node-icon.subject::before {
  content: "📚";
}

.node-icon.chapter::before {
  content: "📑";
}

.node-icon.section::before {
  content: "📄";
}

/* 节点文本 */
.node-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 节点数量 */
.node-count {
    width: 20px;
    height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #909399;
    background: #f3f4f6;
    padding: 13px;
    border-radius: 50px;
    font-size: 14px;
    text-align: center;
}

/* 子节点容器 */
.tree-children {
  margin-left: 16px;
}
</style>