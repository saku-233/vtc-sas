import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useMemo } from "react";
import { localApi } from "@/api/localClient";

export const authQuery = queryOptions({
  queryKey: ["auth", "me"],
  queryFn: async () => {
    if (!localApi.auth.hasToken()) return { user: null, error: null };
    try {
      const user = await localApi.auth.me();
      return { user, error: null };
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) {
        localApi.auth.setToken(null);
        return { user: null, error: null };
      }
      throw err;
    }
  },
  staleTime: Infinity,
  retry: false,
});

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const { data, error, isPending } = useQuery(authQuery);

  const value = useMemo(
    () => ({
      user: data?.user ?? null,
      isAuthenticated: !!data?.user,
      isLoadingAuth: isPending,
      authError: data?.error ?? (error ? { type: "unknown", message: error.message ?? "Failed to load session" } : null),
      refresh: () => queryClient.fetchQuery({ ...authQuery, staleTime: 0 }),
      logout: () => {
        queryClient.setQueryData(authQuery.queryKey, { user: null, error: null });
        localApi.auth.logout("/login");
      },
      navigateToLogin: () => {
        window.location.href = `/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      },
    }),
    [data, error, isPending, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
