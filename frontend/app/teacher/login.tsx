import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, Input, Card, HeaderBar, Banner } from "../../src/ui";
import { COLORS, SPACING, RADII, SHADOW_SM } from "../../src/theme";
import { Api } from "../../src/api";

export default function TeacherLogin() {
  const router = useRouter();
  const [list, setList] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Api.teacherPublicList().then((l: any[]) => setList(l.filter((t) => t.active))).catch(() => {});
  }, []);

  const onLogin = async () => {
    setErr("");
    if (!selected) return setErr("Please select your account.");
    setLoading(true);
    try {
      const res = await Api.teacherLogin(selected, pwd);
      await AsyncStorage.setItem("teacher", JSON.stringify(res));
      router.replace("/teacher/dashboard");
    } catch (e: any) {
      setErr(e.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={s.safe}>
      <HeaderBar title="👩‍🏫 Teacher Login" subtitle="Select your account" onBack={() => router.replace("/")} testID="teacher-login-header" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={s.scroll}>
          {list.length === 0 ? (
            <Banner kind="warning" testID="no-teachers-banner">No active teachers yet. Ask your admin to add you (admin/admin123).</Banner>
          ) : (
            <View style={{ gap: SPACING.sm }}>
              {list.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  testID={`teacher-option-${t.id}`}
                  onPress={() => setSelected(t.id)}
                  activeOpacity={0.85}
                  style={[s.option, selected === t.id && s.optionActive]}
                >
                  <View style={[s.avatar, selected === t.id && { backgroundColor: COLORS.primary }]}>
                    <Text style={{ fontSize: 22, color: selected === t.id ? "#fff" : COLORS.primary }}>👩‍🏫</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.n900 }}>{t.name}</Text>
                    <Text style={{ fontSize: 13, color: COLORS.n600 }}>{t.subject} · {t.id}</Text>
                  </View>
                  {selected === t.id && <Text style={{ color: COLORS.primary, fontSize: 20, fontWeight: "800" }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Card style={{ marginTop: SPACING.lg }}>
            <Input
              testID="teacher-password-input"
              placeholder="Your password"
              secureTextEntry
              value={pwd}
              onChangeText={setPwd}
              onSubmitEditing={onLogin}
              style={{ marginBottom: SPACING.md }}
            />
            {err ? <Banner kind="error" testID="teacher-login-error">{err}</Banner> : null}
            <Button title="Login" onPress={onLogin} loading={loading} testID="teacher-login-btn" />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.lg },
  option: {
    flexDirection: "row", alignItems: "center", gap: SPACING.md,
    backgroundColor: COLORS.paper, padding: SPACING.md, borderRadius: RADII.md,
    borderWidth: 2, borderColor: COLORS.n200, ...SHADOW_SM,
  },
  optionActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + "0d" },
  avatar: {
    width: 48, height: 48, borderRadius: RADII.md,
    backgroundColor: COLORS.primary + "1a",
    alignItems: "center", justifyContent: "center",
  },
});
