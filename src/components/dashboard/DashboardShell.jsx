import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/lib/theme";
import { getMenu } from "@/lib/dashboardMenu";
import { adminLogout } from "@/lib/auth";
import { showToast } from "@/lib/toast";

export default function DashboardShell({ user, children }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menu = getMenu(user);

  const roleLabel =
    user.role === "SUPER_ADMIN"
      ? "Admin"
      : user.role === "VENDOR"
        ? "Vendor"
        : user.seller_type === "service"
          ? "Service Provider"
          : "Seller";
  const name = user.full_name || roleLabel;

  const go = (item) => {
    setOpen(false);
    if (!item.ready) {
      showToast("This screen is coming soon.");
      return;
    }
    router.push(item.path);
  };

  const logout = async () => {
    setOpen(false);
    await adminLogout();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.page }}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => setOpen(true)} hitSlop={8}>
          <Ionicons name="menu" size={26} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>{roleLabel} Panel</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
        </View>
      </View>

      <View style={{ flex: 1 }}>{children}</View>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.modalRow}>
          <View style={[styles.panel, { paddingTop: insets.top + 12 }]}>
            <Text style={styles.panelName}>{name}</Text>
            <Text style={styles.panelRole}>{roleLabel}</Text>

            <ScrollView style={{ marginTop: 14 }}>
              {menu.map((item) => {
                const active = pathname === item.path;
                return (
                  <Pressable
                    key={item.label}
                    style={[styles.item, active && styles.itemActive]}
                    onPress={() => go(item)}
                  >
                    <Ionicons
                      name={item.icon}
                      size={19}
                      color={active ? "#fff" : colors.green}
                    />
                    <Text
                      style={[styles.itemText, active && styles.itemTextActive]}
                    >
                      {item.label}
                    </Text>
                    {!item.ready && <Text style={styles.soon}>soon</Text>}
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* <Pressable
              style={styles.item}
              onPress={() => {
                setOpen(false);
                router.replace("/");
              }}
            >
              <Ionicons name="home-outline" size={19} color={colors.green} />
              <Text style={styles.itemText}>Back to store</Text>
            </Pressable> */}
            <Pressable
              style={[styles.item, { marginBottom: insets.bottom + 8 }]}
              onPress={logout}
            >
              <Ionicons name="log-out-outline" size={19} color="#d64545" />
              <Text style={[styles.itemText, { color: "#d64545" }]}>
                Log out
              </Text>
            </Pressable>
          </View>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.green,
  },
  headerTitle: { color: "#fff", fontSize: 17, fontWeight: "800" },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.green, fontWeight: "800" },
  modalRow: { flex: 1, flexDirection: "row" },
  panel: {
    width: 290,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
  },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  panelName: { fontSize: 17, fontWeight: "800", color: colors.text },
  panelRole: { fontSize: 13, color: colors.muted, marginTop: 2 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  itemActive: { backgroundColor: colors.green },
  itemText: { flex: 1, fontSize: 14.5, fontWeight: "600", color: "#333" },
  itemTextActive: { color: "#fff" },
  soon: { fontSize: 11, color: colors.muted },
});
