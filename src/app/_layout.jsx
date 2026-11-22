import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack, useRouter, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { adminCheckAuth, onAdminAuth } from "@/lib/auth";
import DashboardShell from "@/components/dashboard/DashboardShell";
import Toast from "@/components/Toast";
import { colors } from "@/lib/theme";

function Guard() {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState({ ready: false, user: null });
  const onLoginPage = pathname === "/login";

  useEffect(() => {
    let cancelled = false;
    adminCheckAuth().then((user) => {
      if (!cancelled) setState({ ready: true, user });
    });
    const off = onAdminAuth((user) => setState({ ready: true, user }));
    return () => {
      cancelled = true;
      off();
    };
  }, []);

  useEffect(() => {
    if (!state.ready) return;
    if (!state.user && !onLoginPage) router.replace("/login");
    if (state.user && onLoginPage) router.replace("/");
  }, [state, onLoginPage]);

  if (!state.ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator color={colors.green} />
      </View>
    );
  }
  if (onLoginPage) return <Stack screenOptions={{ headerShown: false }} />;
  if (!state.user) return null;

  return (
    <DashboardShell user={state.user}>
      <Stack screenOptions={{ headerShown: false, animation: "none" }} />
    </DashboardShell>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Guard />
      <Toast />
    </SafeAreaProvider>
  );
}
