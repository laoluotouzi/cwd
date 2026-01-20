import nav from './configs/nav';
import sidebar from './configs/sidebar';
import { defineConfig } from 'vitepress';

export default defineConfig({
	title: 'CWD 评论系统文档',
	description: '基于 Cloudflare Workers 的轻量级评论系统',
	lang: 'zh-CN',
	head: [
		[
			'link',
			{
				rel: 'icon',
				href: 'https://github.com/anghunk/cwd-comments/blob/main/icon.png?raw=true',
			},
		],
	],
	themeConfig: {
		nav,
		sidebar,
		outline: {
			level: 'deep',
			label: 'On this page',
		},
		editLink: {
			pattern: 'https://github.com/anghunk/cwd-comments/blob/main/docs/:path',
			text: '在 GitHub 上编辑此页面',
		},
		socialLinks: [{ icon: 'github', link: 'https://github.com/anghunk/cwd-comments' }],

		lastUpdated: true,
		lastUpdatedText: '最后更新于',
		footer: {
			message: '基于 Cloudflare Workers 构建',
			copyright: 'Copyright © 2026',
		},
	},
});
