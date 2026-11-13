// Demo auth: «SMS code» login that sets the penka_session cookie (30 days),
// so the session survives a browser or app restart. Profile details live in localStorage.

export const SESSION_COOKIE = 'penka_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, seconds
const PROFILE_KEY = 'penka:profile';
export const WELCOME_BONUS = 120;

export interface Session {
  /** National 10-digit phone number. */
  phone: string;
  issuedAt: number;
}

export interface Profile {
  phone: string;
  name: string;
  bonus: number;
}

function readCookie(name: string): string | null {
  const match = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function writeCookie(name: string, value: string, maxAge: number): void {
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
}

export function getSession(): Session | null {
  const raw = readCookie(SESSION_COOKIE);
  if (!raw) return null;
  try {
    const data = JSON.parse(atob(raw)) as Partial<Session>;
    if (typeof data.phone === 'string' && /^\d{10}$/.test(data.phone)) {
      return { phone: data.phone, issuedAt: Number(data.issuedAt) || 0 };
    }
  } catch {
    // Malformed cookie: treat as logged out.
  }
  return null;
}

/** Demo check: any 4-digit code is accepted. */
export function isValidCode(code: string): boolean {
  return /^\d{4}$/.test(code);
}

export function login(phone: string): Session {
  const session: Session = { phone, issuedAt: Date.now() };
  writeCookie(SESSION_COOKIE, btoa(JSON.stringify(session)), SESSION_MAX_AGE);
  const profile = getProfile();
  if (!profile || profile.phone !== phone) {
    saveProfile({ phone, name: '', bonus: WELCOME_BONUS });
  }
  return session;
}

export function logout(): void {
  writeCookie(SESSION_COOKIE, '', 0);
}

export function getProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<Profile>;
    if (typeof p.phone !== 'string') return null;
    return { phone: p.phone, name: typeof p.name === 'string' ? p.name : '', bonus: Number(p.bonus) || WELCOME_BONUS };
  } catch {
    return null;
  }
}

export function saveProfile(profile: Profile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Storage unavailable — the profile lives only for this page view.
  }
}

/** Profile of the logged-in user (creates one if the cookie outlived localStorage). */
export function currentProfile(): Profile | null {
  const session = getSession();
  if (!session) return null;
  const profile = getProfile();
  if (profile && profile.phone === session.phone) return profile;
  const fresh = { phone: session.phone, name: '', bonus: WELCOME_BONUS };
  saveProfile(fresh);
  return fresh;
}
