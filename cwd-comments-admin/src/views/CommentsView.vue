<template>
	<div class="page">
		<h2 class="page-title">评论管理</h2>
		<div class="toolbar">
			<div class="toolbar-left">
				<select v-model="statusFilter" class="toolbar-select">
					<option value="">全部状态</option>
					<option value="approved">已通过</option>
					<option value="pending">待审核</option>
					<option value="rejected">已拒绝</option>
				</select>
			</div>
			<div class="toolbar-right">
				<button class="toolbar-button" @click="loadComments">刷新</button>
			</div>
		</div>
		<div v-if="loading" class="page-hint">加载中...</div>
		<div v-else-if="error" class="page-error">{{ error }}</div>
		<div v-else>
			<table class="table">
				<thead>
					<tr>
						<th>ID</th>
						<th>文章</th>
						<th>作者</th>
						<th>邮箱</th>
						<th>内容</th>
						<th>状态</th>
						<th>时间</th>
						<th>操作</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="item in filteredComments" :key="item.id">
						<td>{{ item.id }}</td>
						<td>{{ item.postSlug }}</td>
						<td>{{ item.author }}</td>
						<td>{{ item.email }}</td>
						<td class="table-content">{{ item.contentText }}</td>
						<td>{{ item.status }}</td>
						<td>{{ formatDate(item.pubDate) }}</td>
						<td>
							<button class="table-button" @click="changeStatus(item, 'approved')" :disabled="item.status === 'approved'">
								通过
							</button>
							<button class="table-button" @click="changeStatus(item, 'pending')" :disabled="item.status === 'pending'">
								待审
							</button>
							<button class="table-button" @click="changeStatus(item, 'rejected')" :disabled="item.status === 'rejected'">
								拒绝
							</button>
							<button class="table-button table-button-danger" @click="removeComment(item)">删除</button>
						</td>
					</tr>
					<tr v-if="filteredComments.length === 0">
						<td colspan="8" class="page-hint">暂无数据</td>
					</tr>
				</tbody>
			</table>
			<div v-if="pagination.total > 1" class="pagination">
				<button class="pagination-button" :disabled="pagination.page <= 1" @click="goPage(pagination.page - 1)">上一页</button>
				<span class="pagination-info">{{ pagination.page }} / {{ pagination.total }}</span>
				<button class="pagination-button" :disabled="pagination.page >= pagination.total" @click="goPage(pagination.page + 1)">
					下一页
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { CommentItem, CommentListResponse, fetchComments, deleteComment, updateCommentStatus } from '../api/admin';

const comments = ref<CommentItem[]>([]);
const pagination = ref<{ page: number; total: number }>({ page: 1, total: 1 });
const loading = ref(false);
const error = ref('');
const statusFilter = ref('');

const filteredComments = computed(() => {
	if (!statusFilter.value) {
		return comments.value;
	}
	return comments.value.filter((item) => item.status === statusFilter.value);
});

function formatDate(value: string) {
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) {
		return value;
	}
	return d.toLocaleString();
}

async function loadComments(page = 1) {
	loading.value = true;
	error.value = '';
	try {
		const res = await fetchComments(page);
		comments.value = res.data;
		pagination.value = { page: res.pagination.page, total: res.pagination.total };
	} catch (e: any) {
		error.value = e.message || '加载失败';
	} finally {
		loading.value = false;
	}
}

async function goPage(page: number) {
	if (page < 1 || page > pagination.value.total) {
		return;
	}
	await loadComments(page);
}

async function changeStatus(item: CommentItem, status: string) {
	try {
		await updateCommentStatus(item.id, status);
		item.status = status;
	} catch (e: any) {
		error.value = e.message || '更新状态失败';
	}
}

async function removeComment(item: CommentItem) {
	if (!window.confirm(`确认删除评论 ${item.id} 吗`)) {
		return;
	}
	try {
		await deleteComment(item.id);
		comments.value = comments.value.filter((c) => c.id !== item.id);
	} catch (e: any) {
		error.value = e.message || '删除失败';
	}
}

onMounted(() => {
	loadComments();
});
</script>

<style scoped>
.page {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.page-title {
	margin: 0;
	font-size: 18px;
	color: #24292f;
}

.toolbar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8px;
}

.toolbar-left {
	display: flex;
	gap: 8px;
}

.toolbar-right {
	display: flex;
	gap: 8px;
}

.toolbar-select {
	padding: 4px 8px;
	font-size: 13px;
}

.toolbar-button {
	padding: 6px 10px;
	border-radius: 4px;
	border: 1px solid #d0d7de;
	background-color: #f6f8fa;
	cursor: pointer;
	font-size: 13px;
}

.page-hint {
	font-size: 14px;
	color: #57606a;
}

.page-error {
	font-size: 14px;
	color: #d1242f;
}

.table {
	width: 100%;
	border-collapse: collapse;
	background-color: #ffffff;
}

.table th,
.table td {
	border: 1px solid #d0d7de;
	padding: 6px 8px;
	font-size: 13px;
	text-align: left;
	vertical-align: top;
}

.table-content {
	max-width: 260px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.table-button {
	margin-right: 4px;
	padding: 4px 6px;
	border-radius: 4px;
	border: 1px solid #d0d7de;
	background-color: #f6f8fa;
	font-size: 12px;
	cursor: pointer;
}

.table-button-danger {
	border-color: #d1242f;
	color: #d1242f;
}

.pagination {
	margin-top: 8px;
	display: flex;
	align-items: center;
	gap: 8px;
}

.pagination-button {
	padding: 4px 8px;
	border-radius: 4px;
	border: 1px solid #d0d7de;
	background-color: #f6f8fa;
	font-size: 12px;
	cursor: pointer;
}

.pagination-info {
	font-size: 13px;
}
</style>

