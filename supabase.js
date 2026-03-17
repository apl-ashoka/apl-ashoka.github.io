/* ── SUPABASE CONFIG ── replace these two values after creating your project ── */
const SUPABASE_URL  = 'https://ypkzlblmaeuhbfvqswvo.supabase.co';
const SUPABASE_ANON = 'sb_publishable_uF5S1z-SR5-rRt3AVCliGA_RDug3t9j';

/* ── lightweight Supabase REST client (no SDK needed) ── */
const sb = {
  /* generic SELECT */
  async from(table, query = '') {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${sb._token() || SUPABASE_ANON}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  /* PATCH (update) */
  async update(table, match, body) {
    const params = Object.entries(match).map(([k,v]) => `${k}=eq.${encodeURIComponent(v)}`).join('&');
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${sb._token()}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  /* INSERT */
  async insert(table, body) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${sb._token()}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  /* DELETE */
  async delete(table, match) {
    const params = Object.entries(match).map(([k,v]) => `${k}=eq.${encodeURIComponent(v)}`).join('&');
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${sb._token()}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw await res.json();
    return true;
  },

  /* AUTH: sign in with email+password */
  async signIn(email, password) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    localStorage.setItem('apl_session', JSON.stringify(data));
    return data;
  },

  /* AUTH: sign out */
  async signOut() {
    const token = sb._token();
    if (token) {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` },
      });
    }
    localStorage.removeItem('apl_session');
  },

  /* AUTH: get current user from session */
  async getUser() {
    const token = sb._token();
    if (!token) return null;
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` },
    });
    if (!res.ok) { localStorage.removeItem('apl_session'); return null; }
    return res.json();
  },

  _token() {
    try {
      const s = JSON.parse(localStorage.getItem('apl_session'));
      return s?.access_token || null;
    } catch { return null; }
  },
};
