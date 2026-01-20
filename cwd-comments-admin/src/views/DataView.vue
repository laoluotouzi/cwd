<template>
  <div class="page">
    <h2 class="page-title">数据管理</h2>
    <div
      v-if="toastVisible"
      class="toast"
      :class="toastType === 'error' ? 'toast-error' : 'toast-success'"
    >
      {{ toastMessage }}
    </div>
    
    <div class="card">
      <h3 class="card-title">数据导出</h3>
      <p class="card-desc">
        将所有评论数据导出为 JSON 格式。
      </p>
      <div class="card-actions">
        <button class="card-button" :disabled="exporting" @click="handleExport">
          <span v-if="exporting">导出中...</span>
          <span v-else>导出 JSON</span>
        </button>
      </div>
    </div>

    <div class="card">
      <h3 class="card-title">数据导入</h3>
      <p class="card-desc">
        从其他评论系统导入数据。请选择来源并上传 JSON 文件。
      </p>
      
      <div class="form-group">
        <label class="form-label">来源系统</label>
        <select v-model="importSource" class="form-select">
          <option value="twikoo">Twikoo</option>
        </select>
      </div>

      <div class="card-actions">
        <input 
          type="file" 
          ref="fileInput" 
          accept=".json" 
          style="display: none" 
          @change="handleFileChange"
        >
        <button class="card-button" :disabled="importing" @click="triggerFileInput">
          <span v-if="importing">导入中...</span>
          <span v-else>选择文件并导入</span>
        </button>
      </div>
      
      <div v-if="importLogs.length > 0" class="log-container">
        <div class="log-title">导入日志</div>
        <div class="log-list">
            <div v-for="(log, index) in importLogs" :key="index" class="log-item">
            {{ log }}
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { exportComments, importComments } from "../api/admin";

const exporting = ref(false);
const importing = ref(false);
const importSource = ref("twikoo");
const fileInput = ref<HTMLInputElement | null>(null);
const toastMessage = ref("");
const toastType = ref<"success" | "error">("success");
const toastVisible = ref(false);
const importLogs = ref<string[]>([]);

function showToast(msg: string, type: "success" | "error" = "success") {
  toastMessage.value = msg;
  toastType.value = type;
  toastVisible.value = true;
  window.setTimeout(() => {
    toastVisible.value = false;
  }, 2000);
}

function addLog(msg: string) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const timeStr = `${y}.${m}.${d} ${h}:${min}:${s}`;
  importLogs.value.push(`${timeStr} ${msg}`);
}

async function handleExport() {
  exporting.value = true;
  try {
    const data = await exportComments();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comments-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    showToast("导出成功", "success");
  } catch (e: any) {
    showToast(e.message || "导出失败", "error");
  } finally {
    exporting.value = false;
  }
}

function triggerFileInput() {
  fileInput.value?.click();
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  // 重置 input，允许重复选择同一文件
  target.value = '';
  
  // 清空之前的日志
  importLogs.value = [];

  importing.value = true;
  addLog(`开始导入文件 ${file.name}`);
  addLog("正在读取文件...");

  const reader = new FileReader();

  reader.onload = async (e) => {
    try {
      const content = e.target?.result as string;
      addLog("文件读取完成，正在解析数据...");
      
      let json;
      try {
        json = JSON.parse(content);
      } catch (parseError) {
        throw new Error("JSON 解析失败，请检查文件格式");
      }
      
      const count = Array.isArray(json) ? json.length : 1;
      addLog(`解析成功，共 ${count} 条数据`);
      addLog("正在上传并导入数据库...");
      
      // 这里可以根据 importSource 做一些预处理，目前只有 twikoo/通用
      // 假设 json 已经是我们要的格式
      
      const res = await importComments(json);
      addLog(`导入完成: ${res.message || '成功'}`);
      showToast(res.message || "导入成功", "success");
    } catch (err: any) {
      console.error(err);
      addLog(`导入失败: ${err.message || '未知错误'}`);
      showToast(err.message || "导入失败，文件格式错误", "error");
    } finally {
      importing.value = false;
    }
  };

  reader.onerror = () => {
    addLog("读取文件失败");
    showToast("读取文件失败", "error");
    importing.value = false;
  };

  reader.readAsText(file);
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 520px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  color: #24292f;
}

.card {
  background-color: #ffffff;
  border-radius: 6px;
  border: 1px solid #d0d7de;
  padding: 16px 18px;
  margin-bottom: 1em;
}

.card-title {
  margin: 0 0 12px;
  font-size: 15px;
}

.card-desc {
  font-size: 14px;
  color: #57606a;
  margin: 0 0 16px;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
}

.card-button {
  padding: 8px 14px;
  border-radius: 4px;
  border: none;
  background-color: #0969da;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
}

.card-button:disabled {
  opacity: 0.7;
  cursor: default;
}

.form-group {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  color: #24292f;
  font-weight: 500;
}

.form-select {
  padding: 6px 8px;
  border: 1px solid #d0d7de;
  border-radius: 4px;
  font-size: 14px;
  color: #24292f;
  background-color: #f6f8fa;
  outline: none;
}

.form-select:focus {
  border-color: #0969da;
  box-shadow: 0 0 0 2px rgba(9, 105, 218, 0.3);
}

.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  min-width: 220px;
  max-width: 320px;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 13px;
  box-shadow: 0 8px 24px rgba(140, 149, 159, 0.2);
  z-index: 1000;
}

.toast-success {
  background-color: #1a7f37;
  color: #ffffff;
}

.toast-error {
  background-color: #d1242f;
  color: #ffffff;
}

.log-container {
  margin-top: 16px;
  padding: 12px;
  background-color: #f6f8fa;
  border-radius: 6px;
  border: 1px solid #d0d7de;
}

.log-title {
  font-size: 13px;
  font-weight: 600;
  color: #24292f;
  margin-bottom: 8px;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.log-item {
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  color: #57606a;
  line-height: 1.5;
}
</style>
