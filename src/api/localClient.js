const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const TOKEN_KEY = "vtc_sas_token";
const USER_KEY = "vtc_sas_user";

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (typeof window === "undefined") return;
  if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(USER_KEY);
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.detail || data.message || `HTTP ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const localApi = {
  courses: {
    list: () => apiFetch("/api/v1/courses"),
  },
  assignments: {
    list: () => apiFetch("/api/v1/assignments"),
    create: (data) => apiFetch("/api/v1/assignments", { method: "POST", body: JSON.stringify(data) }),
    bulkCreate: (items) => apiFetch("/api/v1/assignments/bulk", { method: "POST", body: JSON.stringify({ items }) }),
    update: (id, data) => apiFetch(`/api/v1/assignments/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(data) }),
    bulkUpdate: (items) => apiFetch("/api/v1/assignments/bulk", { method: "PATCH", body: JSON.stringify({ items }) }),
    delete: (id) => apiFetch(`/api/v1/assignments/${encodeURIComponent(id)}`, { method: "DELETE" }),
    bulkDelete: (ids) => apiFetch("/api/v1/assignments/bulk", { method: "DELETE", body: JSON.stringify({ ids }) }),
  },
  attendance: {
    list: () => apiFetch("/api/v1/attendance"),
  },
  reminders: {
    list: () => apiFetch("/api/v1/reminders"),
  },
  users: {
    list: () => apiFetch("/api/v1/users"),
    invite: (data) => apiFetch("/api/v1/users/invite", { method: "POST", body: JSON.stringify(data) }),
    promoteTeacher: () => apiFetch("/api/v1/users/promote-teacher", { method: "POST" }),
  },
  ai: {
    generateQuiz: () => apiFetch("/api/v1/ai/quiz", { method: "POST" }),
    chat: async (question, provider = "local") => {
      const data = await apiFetch("/api/v1/ai/chat", { method: "POST", body: JSON.stringify({ question, provider }) });
      return data.answer ?? data.response ?? data.text ?? "Sorry, the local AI couldn't answer that question.";
    },
  },
  auth: {
    hasToken: () => Boolean(getToken()),
    setToken,

    async login({ email, password, role = "student" }) {
      const isStaff = role === "teacher" || role === "staff";
      const endpoint = isStaff ? "/api/v1/staff/login" : "/api/v1/students/login";
      const username = email.includes("@") ? email.split("@")[0] : email;
      const result = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      });

      if (result.access_token) {
        setToken(result.access_token);
        const profile = result.user || {
          email,
          username,
          full_name: username,
          role: isStaff ? "admin" : "user",
        };
        setStoredUser(profile);
      }
      return result;
    },

    async register({ email, password, role = "student", full_name, student_id, class_name }) {
      const isStaff = role === "teacher" || role === "staff";
      const endpoint = isStaff ? "/api/v1/staff/register" : "/api/v1/students/register";
      const username = email.includes("@") ? email.split("@")[0] : email;
      const payload = isStaff
        ? { username, email, password, full_name: full_name || username }
        : {
            username,
            email,
            password,
            full_name: full_name || username,
            student_id: student_id || username,
            class_name: class_name || "IT114115",
          };

      return apiFetch(endpoint, { method: "POST", body: JSON.stringify(payload) });
    },

    async me() {
      if (!getToken()) return null;
      const stored = getStoredUser();
      if (stored?.role !== "admin") {
        try {
          const me = await apiFetch("/api/v1/students/me");
          const normalized = { ...me, role: me?.role || "user" };
          setStoredUser(normalized);
          return normalized;
        } catch (error) {
          if (error.status === 401 || error.status === 403) throw error;
        }
      }
      if (stored) return stored;

      try {
        return await apiFetch("/api/v1/staff/me");
      } catch (error) {
        if (error.status === 401 || error.status === 403) throw error;
        return null;
      }
    },

    async resetPasswordRequest(email) {
      return apiFetch("/api/v1/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    },

    async resetPassword({ resetToken, newPassword }) {
      return apiFetch("/api/v1/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token: resetToken, new_password: newPassword }),
      });
    },

    logout(redirectUrl = "/login") {
      setToken(null);
      setStoredUser(null);
      if (typeof window !== "undefined") window.location.href = redirectUrl;
    },
  },
};
