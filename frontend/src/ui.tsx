import React from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Modal, Pressable,
} from "react-native";
import { COLORS, RADII, SPACING, SHADOW_SM } from "./theme";

// ── Button ──
export function Button({
  title, onPress, variant = "primary", disabled, loading, testID, style, icon,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "accent" | "outline" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
  style?: any;
  icon?: React.ReactNode;
}) {
  const palette: any = {
    primary: { bg: COLORS.primary, fg: "#fff", border: COLORS.primary },
    accent: { bg: COLORS.accent, fg: "#fff", border: COLORS.accent },
    outline: { bg: "transparent", fg: COLORS.primary, border: COLORS.primary },
    ghost: { bg: "transparent", fg: COLORS.n700, border: "transparent" },
    danger: { bg: COLORS.error, fg: "#fff", border: COLORS.error },
  };
  const p = palette[variant];
  return (
    <TouchableOpacity
      testID={testID}
      disabled={disabled || loading}
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.btn,
        { backgroundColor: p.bg, borderColor: p.border, opacity: disabled ? 0.5 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {icon}
          <Text style={{ color: p.fg, fontSize: 16, fontWeight: "600" }}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Input ──
export const Input = React.forwardRef<TextInput, any>(function Input(props, ref) {
  return (
    <TextInput
      ref={ref}
      placeholderTextColor={COLORS.n500}
      {...props}
      style={[styles.input, props.style]}
    />
  );
});

// ── Card ──
export function Card({ children, style, testID }: any) {
  return <View testID={testID} style={[styles.card, style]}>{children}</View>;
}

// ── Header bar ──
export function HeaderBar({ title, subtitle, onBack, right, testID }: {
  title: string; subtitle?: string; onBack?: () => void; right?: React.ReactNode; testID?: string;
}) {
  return (
    <View style={styles.headerBar} testID={testID}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.backBtn} testID="header-back-btn">
          <Text style={{ color: COLORS.primary, fontSize: 16, fontWeight: "600" }}>← Back</Text>
        </TouchableOpacity>
      )}
      <View style={{ flex: 1, marginLeft: onBack ? SPACING.md : 0 }}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

// ── Banner / Error ──
export function Banner({ kind = "info", children, testID }: any) {
  const palette: any = {
    info: { bg: "#E7F5EE", fg: COLORS.primary },
    error: { bg: "#FDECEC", fg: COLORS.error },
    warning: { bg: "#FFF4E5", fg: COLORS.warning },
    success: { bg: "#E7F5EE", fg: COLORS.success },
  };
  const p = palette[kind];
  return (
    <View testID={testID} style={[styles.banner, { backgroundColor: p.bg, borderColor: p.fg + "33" }]}>
      <Text style={{ color: p.fg, fontSize: 14, fontWeight: "500" }}>{children}</Text>
    </View>
  );
}

// ── Picker (modal-based dropdown) ──
export function Picker({
  label, value, onChange, options, placeholder, testID,
}: {
  label?: string; value: string; onChange: (v: string) => void;
  options: string[]; placeholder?: string; testID?: string;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <View style={{ marginBottom: SPACING.md }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TouchableOpacity
        testID={testID}
        activeOpacity={0.85}
        style={styles.input}
        onPress={() => setOpen(true)}
      >
        <Text style={{ color: value ? COLORS.n900 : COLORS.n500, fontSize: 16 }}>
          {value || placeholder || `Select ${label || ""}`}
        </Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <Text style={[styles.headerTitle, { marginBottom: SPACING.md }]}>{label || "Select"}</Text>
            <ScrollView style={{ maxHeight: 360 }}>
              {options.map((o) => (
                <TouchableOpacity
                  key={o}
                  testID={`${testID || "picker"}-option-${o.replace(/\s+/g, "-")}`}
                  style={[
                    styles.optionRow,
                    value === o && { backgroundColor: COLORS.primary + "11" },
                  ]}
                  onPress={() => { onChange(o); setOpen(false); }}
                >
                  <Text style={{ color: COLORS.n900, fontSize: 16 }}>{o}</Text>
                  {value === o && <Text style={{ color: COLORS.primary, fontWeight: "700" }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ── Section title ──
export function SectionTitle({ children, style }: any) {
  return <Text style={[styles.sectionTitle, style]}>{children}</Text>;
}

// ── Pill ──
export function Pill({ children, color = COLORS.primary, bg }: any) {
  return (
    <View style={[styles.pill, { backgroundColor: bg || color + "1a" }]}>
      <Text style={{ color, fontSize: 12, fontWeight: "700" }}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 48,
    borderRadius: RADII.md,
    borderWidth: 1.5,
    paddingHorizontal: SPACING.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    minHeight: 48,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: COLORS.n200,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.md,
    fontSize: 16,
    color: COLORS.n900,
    justifyContent: "center",
  },
  card: {
    backgroundColor: COLORS.paper,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.n200,
    padding: SPACING.lg,
    ...SHADOW_SM,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.paper,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.n200,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.muted,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.n900 },
  headerSubtitle: { fontSize: 12, color: COLORS.n600, marginTop: 2 },
  banner: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADII.md,
    borderWidth: 1,
    marginVertical: SPACING.sm,
  },
  modalBackdrop: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: RADII.xl,
    borderTopRightRadius: RADII.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  optionRow: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADII.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: { fontSize: 13, fontWeight: "600", color: COLORS.n700, marginBottom: 6 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: COLORS.n900, marginBottom: 8 },
  pill: {
    paddingVertical: 4, paddingHorizontal: 10, borderRadius: RADII.pill,
    alignSelf: "flex-start",
  },
});
