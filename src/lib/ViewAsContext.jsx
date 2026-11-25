import { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "vtc-sas:view-as";

/**
 * 客户端「以某用户身份查看」(view-as) 状态。
 * 超级管理员在 /admin 选择一个用户后，导航栏与主题会切换到该用户的角色视角，
 * 但底层的 Base44 会话仍是管理员本人（数据读取沿用管理员权限）。
 */
const ViewAsContext = createContext(null);

function readStored() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function ViewAsProvider({ children }) {
  const [viewAs, setViewAs] = useState(null);

  useEffect(() => {
    setViewAs(readStored());
    function onStorage(e) {
      if (e.key === STORAGE_KEY) setViewAs(readStored());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const set = useCallback((user) => {
    const value = user
      ? { email: user.email, role: user.role, full_name: user.full_name }
      : null;
    if (typeof window !== "undefined") {
      if (value) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      else window.localStorage.removeItem(STORAGE_KEY);
    }
    setViewAs(value);
  }, []);

  const clear = useCallback(() => {
    if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
    setViewAs(null);
  }, []);

  return (
    <ViewAsContext.Provider value={{ viewAs, setViewAs: set, clearViewAs: clear }}>
      {children}
    </ViewAsContext.Provider>
  );
}

export function useViewAs() {
  const ctx = useContext(ViewAsContext);
  if (!ctx) throw new Error("useViewAs must be used within <ViewAsProvider>");
  return ctx;
}