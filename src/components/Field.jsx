import { View, Text, TextInput, StyleSheet } from "react-native";
import { colors } from "@/lib/theme";

export default function Field({ label, required, style, ...inputProps }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor="#999"
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 13, fontWeight: "600", color: "#333" },
  required: { color: "#d64545" },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: "#fff",
  },
});
