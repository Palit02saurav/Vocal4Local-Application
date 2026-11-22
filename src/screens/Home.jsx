import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from "react-native";
import adminApi from "@/lib/api";
import { getAdminUser } from "@/lib/auth";
import { colors } from "@/lib/theme";

const STATUS_COLORS = {
  Pending: "#f5a623",
  Confirmed: "#2f8d46",
  Processing: "#4a90d9",
  Shipped: "#8e44ad",
  "Out for Delivery": "#c97a2e",
  Delivered: "#2ec4c6",
  Cancelled: "#e63946",
};

const rupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const safeGet = async (path) => {
  try {
    const res = await adminApi.get(path);
    return res.data?.data || {};
  } catch {
    return {};
  }
};

export default function Home() {
  const user = getAdminUser();
  const role = user?.role;
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const isAdmin = role === "SUPER_ADMIN";
    const isVendor = role === "VENDOR";
    const isSeller = role === "SELLER";
    const rowBased = !isAdmin; // sellers and vendors get order ITEMS, admin gets orders

    const [orders, products, services, sellers, customers, me] =
      await Promise.all([
        safeGet("/orders"),
        safeGet(
          isVendor ? "/products?deliveryType=All&productType=All" : "/products",
        ),
        isVendor ? {} : safeGet("/services"),
        isAdmin ? safeGet("/sellers") : {},
        isAdmin ? safeGet("/customers") : {},
        isSeller ? safeGet("/sellers/me") : {},
      ]);

    const orderList = orders.orders || [];
    const orderCount = rowBased
      ? new Set(orderList.map((i) => i.order_id)).size
      : orderList.length;
    const revenue = rowBased
      ? orderList.reduce((s, i) => s + Number(i.price) * i.quantity, 0)
      : orderList.reduce((s, o) => s + Number(o.total), 0);

    const byOrder = new Map();
    orderList.forEach((raw) => {
      const id = rowBased ? (raw.order_id ?? raw.order?.id ?? raw.id) : raw.id;
      const status = rowBased ? raw.order?.status : raw.status;
      if (status) byOrder.set(id, status);
    });
    const statusCounts = {};
    byOrder.forEach((status) => {
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    setStats({
      sellerType: me.seller?.seller_type || user?.seller_type || null,
      orderCount,
      revenue,
      products: (products.products || []).length,
      services: (services.services || []).length,
      sellers: (sellers.sellers || []).filter(
        (s) => s.approval_status !== "Rejected",
      ).length,
      customers: (customers.customers || []).length,
      statusCounts,
    });
  }, [role]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (!stats) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Loading dashboard...</Text>
      </View>
    );
  }

  const cards = [
    { label: "Total Orders", value: stats.orderCount, icon: "📦" },
    { label: "Total Revenue", value: rupees(stats.revenue), icon: "💰" },
  ];
  if (role !== "VENDOR" && stats.sellerType !== "service") {
    cards.push({ label: "Total Products", value: stats.products, icon: "🛍️" });
  }
  if (role === "VENDOR") {
    cards.push({ label: "Fresh Products", value: stats.products, icon: "🥬" });
  }
  if (role !== "VENDOR" && stats.sellerType !== "product") {
    cards.push({ label: "Total Services", value: stats.services, icon: "🛠️" });
  }
  if (role === "SUPER_ADMIN") {
    cards.push({ label: "Total Sellers", value: stats.sellers, icon: "🏪" });
    cards.push({ label: "Total Users", value: stats.customers, icon: "👥" });
  }

  const statuses = Object.entries(stats.statusCounts);

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, gap: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.welcome}>
        Welcome back, {user?.full_name || "there"}!
      </Text>

      <View style={styles.grid}>
        {cards.map((c) => (
          <View key={c.label} style={styles.card}>
            <Text style={styles.cardIcon}>{c.icon}</Text>
            <Text style={styles.cardValue}>{c.value}</Text>
            <Text style={styles.cardLabel}>{c.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Orders by status</Text>
        {statuses.length === 0 ? (
          <Text style={styles.muted}>No orders yet.</Text>
        ) : (
          statuses.map(([status, count]) => (
            <View key={status} style={styles.statusRow}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: STATUS_COLORS[status] || "#999" },
                ]}
              />
              <Text style={styles.statusLabel}>{status}</Text>
              <Text style={styles.statusCount}>{count}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  muted: { color: colors.muted, fontSize: 13.5 },
  welcome: { fontSize: 20, fontWeight: "800", color: colors.text },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    width: "47.5%",
    padding: 14,
    gap: 4,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardIcon: { fontSize: 22 },
  cardValue: { fontSize: 22, fontWeight: "800", color: colors.text },
  cardLabel: { fontSize: 12.5, color: colors.muted },
  panel: {
    padding: 16,
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  panelTitle: { fontSize: 16, fontWeight: "800", color: colors.text },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { flex: 1, fontSize: 14, color: "#333" },
  statusCount: { fontSize: 14, fontWeight: "700", color: colors.text },
});
