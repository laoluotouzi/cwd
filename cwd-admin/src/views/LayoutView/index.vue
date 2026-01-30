<template>
  <div class="layout">
    <header class="layout-header">
      <button
        class="layout-menu-toggle"
        @click="toggleSider"
        aria-label="切换菜单"
        type="button"
      >
        <PhTextIndent :size="20" />
      </button>
      <div class="layout-title">CWD 评论系统</div>
      <div class="layout-actions-wrapper">
        <div class="layout-domain-filter layout-domain-filter-header">
          <select v-model="domainFilter" class="layout-domain-select">
            <option value="">全部域名</option>
            <option v-for="item in domainOptions" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </div>
        <div class="layout-actions">
          <a class="layout-button" href="https://cwd.js.org" target="_blank">
            使用文档
          </a>
          <a class="layout-button" href="https://github.com/anghunk/cwd" target="_blank">
            Github
          </a>
          <button
            class="layout-button"
            @click="cycleTheme"
            :title="themeTitle"
            type="button"
          >
            <PhSun v-if="theme === 'light'" :size="16" />
            <PhMoon v-else-if="theme === 'dark'" :size="16" />
            <PhAirplay v-else :size="16" />
          </button>
          <button class="layout-button" @click="handleLogout">退出</button>
        </div>

        <button
          class="layout-actions-toggle"
          @click="toggleActions"
          aria-label="更多操作"
          type="button"
        >
          <PhDotsThreeVertical :size="20" bold />
        </button>
        <div v-if="isActionsOpen" class="layout-actions-dropdown">
          <button class="layout-actions-item" type="button" @click="openDocs">
            使用文档
          </button>
          <button class="layout-actions-item" type="button" @click="openGithub">
            Github
          </button>
          <button
            class="layout-actions-item layout-actions-item-danger"
            type="button"
            @click="handleLogoutFromActions"
          >
            退出
          </button>
        </div>
      </div>
    </header>
    <div class="layout-body">
      <nav
        class="layout-sider"
        :class="{ 'layout-sider-mobile-open': isMobileSiderOpen }"
      >
        <div class="layout-sider-domain-filter">
          <select v-model="domainFilter" class="layout-domain-select">
            <option value="">全部域名</option>
            <option v-for="item in domainOptions" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </div>
        <ul class="menu">
          <li
            class="menu-item"
            :class="{ active: isRouteActive('comments') }"
            @click="goComments"
          >
            评论管理
          </li>
          <li
            class="menu-item"
            :class="{ active: isRouteActive('stats') }"
            @click="goStats"
          >
            数据看板
          </li>
          <li
            class="menu-item"
            :class="{ active: isRouteActive('analytics') }"
            @click="goAnalytics"
          >
            访问统计
          </li>
          <li
            class="menu-item"
            :class="{ active: isRouteActive('settings') }"
            @click="goSettings"
          >
            网站设置
          </li>
          <li
            class="menu-item"
            :class="{ active: isRouteActive('data') }"
            @click="goData"
          >
            数据管理
          </li>
        </ul>
      </nav>
      <div v-if="isMobileSiderOpen" class="layout-sider-mask" @click="closeSider" />
      <main class="layout-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, provide, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { logoutAdmin, fetchDomainList } from "../../api/admin";
import { useTheme } from "../../composables/useTheme";

const DOMAIN_STORAGE_KEY = "cwd_admin_domain_filter";

const router = useRouter();
const route = useRoute();
const { theme, setTheme } = useTheme();

const isMobileSiderOpen = ref(false);
const isActionsOpen = ref(false);

const themeTitle = computed(() => {
  if (theme.value === "light") return "明亮模式";
  if (theme.value === "dark") return "暗黑模式";
  return "跟随系统";
});

function cycleTheme() {
  if (theme.value === "system") setTheme("light");
  else if (theme.value === "light") setTheme("dark");
  else setTheme("system");
}

const storedDomain =
  typeof window !== "undefined"
    ? window.localStorage.getItem(DOMAIN_STORAGE_KEY) || ""
    : "";
const domainFilter = ref(storedDomain);
const domainOptions = ref<string[]>([]);

async function loadDomains() {
  try {
    const res = await fetchDomainList();
    const domains = Array.isArray(res.domains) ? res.domains : [];
    const set = new Set(domains);
    if (domainFilter.value && !set.has(domainFilter.value)) {
      set.add(domainFilter.value);
    }
    domainOptions.value = Array.from(set);
  } catch {
    domainOptions.value = [];
  }
}

provide("domainFilter", domainFilter);

onMounted(() => {
  loadDomains();
});

watch(domainFilter, (value) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(DOMAIN_STORAGE_KEY, value || "");
  }
});

function isRouteActive(name: string) {
  return route.name === name;
}

function closeSider() {
  isMobileSiderOpen.value = false;
}

function toggleSider() {
  isMobileSiderOpen.value = !isMobileSiderOpen.value;
}

function toggleActions() {
  isActionsOpen.value = !isActionsOpen.value;
}

function closeActions() {
  isActionsOpen.value = false;
}

function goComments() {
  router.push({ name: "comments" });
  closeSider();
}

function goStats() {
  router.push({ name: "stats" });
  closeSider();
}

function goAnalytics() {
  router.push({ name: "analytics" });
  closeSider();
}

function goData() {
  router.push({ name: "data" });
  closeSider();
}

function goSettings() {
  router.push({ name: "settings" });
  closeSider();
}

function openDocs() {
  window.open("https://cwd.js.org", "_blank");
  closeActions();
}

function openGithub() {
  window.open("https://github.com/anghunk/cwd", "_blank");
  closeActions();
}

function handleLogout() {
  logoutAdmin();
  router.push({ name: "login" });
  closeSider();
}

function handleLogoutFromActions() {
  closeActions();
  handleLogout();
}
</script>

<style scoped lang="less">
@import "../../styles/layout.less";
</style>
