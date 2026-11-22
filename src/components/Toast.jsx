import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { on } from "@/lib/events";

export default function Toast() {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    const off = on("app-toast", (t) => {
      setToast(t);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(null), 2800);
    });
    return () => {
      off();
      clearTimeout(timer.current);
    };
  }, []);

  if (!toast) return null;

  return (
    <View pointerEvents="none" style={[styles.wrap, { top: insets.top + 10 }]}>
      <View
        style={[
          styles.box,
          { backgroundColor: toast.type === "error" ? "#d64545" : "#1f7a4d" },
        ]}
      >
        <Text style={styles.text}>{toast.message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 16, right: 16, alignItems: "center" },
  box: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  text: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
