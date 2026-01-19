import { Context } from 'hono';
import { Bindings } from '../../bindings';

export const getAdminEmail = async (c: Context<{ Bindings: Bindings }>) => {
  try {
    let email: string | null = null;
    if (c.env.CWD_CONFIG_KV) {
      email = await c.env.CWD_CONFIG_KV.get('settings:admin_notify_email');
    }
    if (!email) {
      email = c.env.EMAIL_ADDRESS || null;
    }
    return c.json({ email });
  } catch (e: any) {
    return c.json({ message: e.message }, 500);
  }
};

