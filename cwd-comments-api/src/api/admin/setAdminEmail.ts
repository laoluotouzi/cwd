import { Context } from 'hono';
import { Bindings } from '../../bindings';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const setAdminEmail = async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const { email } = await c.req.json();
    if (!email || !isValidEmail(email)) {
      return c.json({ message: '邮箱格式不正确' }, 400);
    }
    if (!c.env.CWD_CONFIG_KV) {
      return c.json({ message: '未配置 CWD_CONFIG_KV，无法保存设置' }, 500);
    }
    await c.env.CWD_CONFIG_KV.put('settings:admin_notify_email', email);
    return c.json({ message: '保存成功' });
  } catch (e: any) {
    return c.json({ message: e.message }, 500);
  }
};

