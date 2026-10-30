import { registerUser, loginUser, signToken } from '../auth.js';
import { publicUser } from '../hub.js';

export async function authRoutes(app) {
  app.post('/api/auth/register', async (req, reply) => {
    const { email, name, password } = req.body || {};
    try {
      const user = await registerUser({ email, name, password });
      const token = signToken(user);
      reply.send({ token, user: publicUser(user) });
    } catch (e) {
      reply.code(400).send({ error: e.message });
    }
  });

  app.post('/api/auth/login', async (req, reply) => {
    const { email, password } = req.body || {};
    try {
      const user = await loginUser({ email, password });
      const token = signToken(user);
      reply.send({ token, user: publicUser(user) });
    } catch (e) {
      reply.code(401).send({ error: e.message });
    }
  });

  app.get('/api/auth/me', { preHandler: [app.authenticate] }, async (req) => {
    return { user: publicUser(req.user) };
  });
}
