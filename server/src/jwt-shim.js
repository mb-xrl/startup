// Minimal HS256 JWT impl (no external deps, Web-safe). Only what we need: sign/verify.
import crypto from 'node:crypto';

function base64url(buf) {
  return buf.toString('base64url');
}
function b64urlJson(obj) {
  return base64url(Buffer.from(JSON.stringify(obj)));
}
function decodeB64url(s) {
  return Buffer.from(s, 'base64url');
}

export function createSigner({ key, expiresIn = '7d' }) {
  let expSec = 7*24*3600;
  if (typeof expiresIn === 'string') {
    const m = expiresIn.match(/^(\d+)([smhd])$/);
    if (m) {
      const n = parseInt(m[1],10);
      expSec = {s:1,m:60,h:3600,d:86400}[m[2]] * n;
    }
  }
  return (payload) => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now()/1000);
    const body = { ...payload, iat: now, exp: now + expSec };
    const h = b64urlJson(header);
    const p = b64urlJson(body);
    const sig = crypto.createHmac('sha256', key).update(`${h}.${p}`).digest();
    return `${h}.${p}.${base64url(sig)}`;
  };
}

export function createVerifier({ key }) {
  return (token) => {
    if (typeof token !== 'string') throw new Error('bad token');
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('bad jwt');
    const [h,p,s] = parts;
    const expected = crypto.createHmac('sha256', key).update(`${h}.${p}`).digest();
    const sig = decodeB64url(s);
    if (expected.length !== sig.length || !crypto.timingSafeEqual(expected, sig)) {
      throw new Error('bad signature');
    }
    const payload = JSON.parse(decodeB64url(p).toString('utf8'));
    const now = Math.floor(Date.now()/1000);
    if (payload.exp && payload.exp < now) throw new Error('token expired');
    return payload;
  };
}
