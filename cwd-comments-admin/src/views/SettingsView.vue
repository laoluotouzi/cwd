<template>
	<div class="page">
		<h2 class="page-title">系统设置</h2>
		<div class="card">
			<h3 class="card-title">通知邮箱设置</h3>
			<div class="form-item">
				<label class="form-label">管理员通知邮箱</label>
				<input v-model="email" class="form-input" type="email" />
			</div>
			<div v-if="message" :class="['form-message', messageType === 'error' ? 'form-message-error' : 'form-message-success']">
				{{ message }}
			</div>
			<div class="card-actions">
				<button class="card-button" :disabled="saving" @click="save">
					<span v-if="saving">保存中...</span>
					<span v-else>保存</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchAdminEmail, saveAdminEmail } from '../api/admin';

const email = ref('');
const saving = ref(false);
const message = ref('');
const messageType = ref<'success' | 'error'>('success');

async function load() {
	try {
		const res = await fetchAdminEmail();
		email.value = res.email || '';
	} catch (e: any) {
		message.value = e.message || '加载失败';
		messageType.value = 'error';
	}
}

async function save() {
	if (!email.value) {
		message.value = '请输入邮箱';
		messageType.value = 'error';
		return;
	}
	saving.value = true;
	message.value = '';
	try {
		const res = await saveAdminEmail(email.value);
		message.value = res.message || '保存成功';
		messageType.value = 'success';
	} catch (e: any) {
		message.value = e.message || '保存失败';
		messageType.value = 'error';
	} finally {
		saving.value = false;
	}
}

onMounted(() => {
	load();
});
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
}

.card-title {
	margin: 0 0 12px;
	font-size: 15px;
}

.form-item {
	display: flex;
	flex-direction: column;
	gap: 6px;
	margin-bottom: 12px;
}

.form-label {
	font-size: 14px;
	color: #555555;
}

.form-input {
	padding: 8px 10px;
	border-radius: 4px;
	border: 1px solid #d0d7de;
	font-size: 14px;
	outline: none;
}

.form-input:focus {
	border-color: #0969da;
	box-shadow: 0 0 0 1px rgba(9, 105, 218, 0.2);
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

.form-message {
	font-size: 13px;
	margin-bottom: 8px;
}

.form-message-success {
	color: #1a7f37;
}

.form-message-error {
	color: #d1242f;
}
</style>

