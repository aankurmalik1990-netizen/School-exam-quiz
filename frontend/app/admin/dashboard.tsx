import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button, Input, Card, HeaderBar, Banner, Pill, SectionTitle } from "../../src/ui";
import { COLORS, SPACING, RADII } from "../../src/theme";
import { Api } from "../../src/api";

type Tab = "teachers" | "students" | "data";

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("teachers");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [newT, setNewT] = useState({ name: "", subject: "", password: "" });
  const [adminPwd, setAdminPwd] = useState("");
  const [status, setStatus] = useState("");
  const [err, setErr] = useState("");

  const flash = (m: string) => { setStatus(m); setTimeout(() => setStatus(""), 2200); };

  const loadTeachers = useCallback(async () => {
    try { setTeachers(await Api.listTeachers()); } catch (e: any) { setErr(e.message); }
  }, []);
  const loadStudents = useCallback(async () => {
    try { setStudents(await Api.adminStudents()); } catch (e: any) { setErr(e.message); }
  }, []);

  useEffect(() => { loadTeachers(); loadStudents(); }, [loadTeachers, loadStudents]);

  const confirm = (msg: string, onYes: () => void) => {
    if (Platform.OS === "web") { if (window.confirm(msg)) onYes(); return; }
    Alert.alert("Confirm", msg, [{ text: "Cancel", style: "cancel" }, { text: "Yes", onPress: onYes, style: "destructive" }]);
  };

  // Teacher CRUD
  const addTeacher = async () => {
    setErr("");
    if (!newT.name.trim() || !newT.password.trim()) return setErr("Name and password required.");
    try {
      await Api.createTeacher({ name: newT.name, subject: newT.subject || "General", password: newT.password });
      setNewT({ name: "", subject: "", password: "" }); flash("✅ Teacher added"); loadTeachers();
    } catch (e: any) { setErr(e.message); }
  };
  const saveEdit = async () => {
    if (!editing.name.trim() || !editing.password.trim()) return setErr("Name and password required.");
    try {
      await Api.updateTeacher(editing.id, { name: editing.name, subject: editing.subject, password: editing.password });
      setEditing(null); flash("✅ Teacher updated"); loadTeachers();
    } catch (e: any) { setErr(e.message); }
  };
  const toggle = async (id: string) => { await Api.toggleTeacher(id); flash("Updated"); loadTeachers(); };
  const remove = async (t: any) => confirm(`Remove ${t.name} and all their data?`, async () => { await Api.deleteTeacher(t.id); flash("🗑 Teacher removed"); loadTeachers(); });
  const clearTeacherData = async (t: any) => confirm(`Clear all test data for ${t.name}?`, async () => { await Api.clearTeacherData(t.id); flash(`🗑 ${t.name} data cleared`); loadTeachers(); });

  const updatePwd = async () => {
    setErr("");
    if (adminPwd.length < 6) return setErr("Min 6 characters.");
    try { await Api.adminPassword(adminPwd); setAdminPwd(""); flash("✅ Password updated"); }
    catch (e: any) { setErr(e.message); }
  };
  const clearAll = () => confirm("DELETE ALL data (teachers, tests, students)?", async () => {
    await Api.clearAll(); flash("🗑 All data cleared"); loadTeachers(); loadStudents();
  });
  const removeStudent = (s: any) => confirm(`Delete history for ${s.student_name}?`, async () => {
    await Api.deleteStudent(s.key); flash("🗑 Deleted"); loadStudents();
  });

  return (
    <SafeAreaView style={s.safe}>
      <HeaderBar
        title="🛡️ Admin Panel"
        subtitle="Full platform management"
        onBack={() => router.replace("/")}
        right={<Button title="🏠" onPress={() => router.replace("/")} variant="ghost" testID="admin-home-btn" />}
        testID="admin-dashboard-header"
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={s.scroll}>
          {status ? <Banner kind="success" testID="admin-status">{status}</Banner> : null}
          {err ? <Banner kind="error" testID="admin-error">{err}</Banner> : null}

          {/* Tab bar */}
          <View style={s.tabs}>
            {(["teachers", "students", "data"] as Tab[]).map((t) => (
              <TouchableOpacity
                key={t}
                testID={`admin-tab-${t}`}
                onPress={() => { setTab(t); setEditing(null); setErr(""); }}
                style={[s.tab, tab === t && s.tabActive]}
              >
                <Text style={[s.tabTxt, tab === t && s.tabTxtActive]}>
                  {t === "teachers" ? "👩‍🏫 Teachers" : t === "students" ? "🎓 Students" : "🗄️ Data"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {tab === "teachers" && (
            <View style={{ gap: SPACING.md }}>
              <View style={s.statRow}>
                <StatTile label="Total" value={teachers.length} />
                <StatTile label="Active" value={teachers.filter((t) => t.active).length} color={COLORS.success} />
                <StatTile label="Disabled" value={teachers.filter((t) => !t.active).length} color={COLORS.error} />
              </View>

              {editing ? (
                <Card>
                  <SectionTitle>✏️ Edit Teacher</SectionTitle>
                  <Input testID="edit-teacher-name" placeholder="Name" value={editing.name} onChangeText={(v: string) => setEditing({ ...editing, name: v })} style={{ marginBottom: SPACING.sm }} />
                  <Input testID="edit-teacher-subject" placeholder="Subject" value={editing.subject} onChangeText={(v: string) => setEditing({ ...editing, subject: v })} style={{ marginBottom: SPACING.sm }} />
                  <Input testID="edit-teacher-password" placeholder="Password" value={editing.password} onChangeText={(v: string) => setEditing({ ...editing, password: v })} style={{ marginBottom: SPACING.md }} />
                  <View style={{ flexDirection: "row", gap: SPACING.sm }}>
                    <Button title="Save" onPress={saveEdit} testID="edit-teacher-save-btn" style={{ flex: 1 }} />
                    <Button title="Cancel" variant="ghost" onPress={() => setEditing(null)} testID="edit-teacher-cancel-btn" style={{ flex: 1 }} />
                  </View>
                </Card>
              ) : (
                <>
                  {teachers.length === 0 && <Banner>No teachers yet. Add one below to get started.</Banner>}
                  {teachers.map((t) => (
                    <Card key={t.id} testID={`teacher-row-${t.id}`}>
                      <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                        <Text style={{ fontWeight: "700", fontSize: 16, color: COLORS.n900 }}>{t.name}</Text>
                        <Pill>{t.subject}</Pill>
                        {!t.active && <Pill color={COLORS.error}>DISABLED</Pill>}
                        {t.test_active && <Pill color={COLORS.success}>🟢 LIVE</Pill>}
                      </View>
                      <Text style={s.meta}>ID: {t.id} · Pass: <Text style={{ fontWeight: "700" }}>{t.password}</Text></Text>
                      <Text style={s.meta}>Tests run: {t.history_count} · Current results: {t.results_count}</Text>
                      <View style={{ flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.md }}>
                        <Button title="✏️" variant="outline" onPress={() => setEditing({ ...t })} testID={`teacher-edit-${t.id}`} style={{ flex: 1 }} />
                        <Button title={t.active ? "⛔" : "✅"} variant="outline" onPress={() => toggle(t.id)} testID={`teacher-toggle-${t.id}`} style={{ flex: 1 }} />
                        <Button title="🗑" variant="danger" onPress={() => remove(t)} testID={`teacher-remove-${t.id}`} style={{ flex: 1 }} />
                      </View>
                    </Card>
                  ))}
                </>
              )}

              {!editing && (
                <Card>
                  <SectionTitle>➕ Add New Teacher</SectionTitle>
                  <Input testID="new-teacher-name" placeholder="Name" value={newT.name} onChangeText={(v: string) => setNewT({ ...newT, name: v })} style={{ marginBottom: SPACING.sm }} />
                  <Input testID="new-teacher-subject" placeholder="Subject (default: General)" value={newT.subject} onChangeText={(v: string) => setNewT({ ...newT, subject: v })} style={{ marginBottom: SPACING.sm }} />
                  <Input testID="new-teacher-password" placeholder="Password" value={newT.password} onChangeText={(v: string) => setNewT({ ...newT, password: v })} style={{ marginBottom: SPACING.md }} />
                  <Button title="➕ Add Teacher" onPress={addTeacher} testID="add-teacher-btn" />
                </Card>
              )}
            </View>
          )}

          {tab === "students" && (
            <View style={{ gap: SPACING.md }}>
              <View style={s.statRow}>
                <StatTile label="Students" value={students.length} />
                <StatTile label="Attempts" value={students.reduce((sum, x) => sum + x.attempts, 0)} color={COLORS.accent} />
              </View>
              {students.length === 0 && <Banner>No student data yet.</Banner>}
              {students.map((st) => (
                <Card key={st.key} testID={`student-row-${st.key}`}>
                  <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                    <Text style={{ fontWeight: "700", fontSize: 16 }}>{st.student_name}</Text>
                    {st.student_class ? <Pill>{st.student_class}</Pill> : null}
                    {st.subjects.map((sub: string) => <Pill key={sub} color={COLORS.accent}>{sub}</Pill>)}
                  </View>
                  <Text style={s.meta}>{st.attempts} attempt(s) · Avg: {st.avg_pct}%</Text>
                  <Button title="🗑 Delete History" variant="danger" onPress={() => removeStudent(st)} testID={`student-delete-${st.key}`} style={{ marginTop: SPACING.sm }} />
                </Card>
              ))}
            </View>
          )}

          {tab === "data" && (
            <View style={{ gap: SPACING.md }}>
              <SectionTitle>🗄️ Database Overview</SectionTitle>
              {teachers.map((t) => (
                <Card key={t.id}>
                  <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                    <Text style={{ fontWeight: "700" }}>{t.name}</Text>
                    {t.test_active ? <Pill color={COLORS.success}>🟢 LIVE</Pill> : <Pill color={COLORS.n500}>Idle</Pill>}
                  </View>
                  <Text style={s.meta}>Tests: {t.history_count} · Results: {t.results_count} · Code: {t.join_code || "—"}</Text>
                  <Button title="🗑 Clear test data" variant="outline" onPress={() => clearTeacherData(t)} testID={`clear-teacher-${t.id}`} style={{ marginTop: SPACING.sm }} />
                </Card>
              ))}

              <Card>
                <SectionTitle>🔑 Change Admin Password</SectionTitle>
                <Input testID="admin-new-password" placeholder="New password (min 6)" secureTextEntry value={adminPwd} onChangeText={setAdminPwd} style={{ marginBottom: SPACING.md }} />
                <Button title="Update Password" onPress={updatePwd} testID="update-admin-password-btn" />
              </Card>

              <Card style={{ borderColor: COLORS.error + "55" }}>
                <SectionTitle style={{ color: COLORS.error }}>⚠️ Danger Zone</SectionTitle>
                <Text style={{ color: COLORS.n700, marginBottom: SPACING.md }}>Delete ALL platform data including teachers, tests, and students.</Text>
                <Button title="🗑 Clear ALL Platform Data" variant="danger" onPress={clearAll} testID="clear-all-btn" />
              </Card>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function StatTile({ label, value, color = COLORS.primary }: { label: string; value: number; color?: string }) {
  return (
    <View style={[s.stat, { borderColor: color + "55", backgroundColor: color + "0d" }]}>
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl, gap: SPACING.md },
  tabs: { flexDirection: "row", backgroundColor: COLORS.muted, borderRadius: RADII.md, padding: 4, marginBottom: SPACING.sm },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: RADII.sm },
  tabActive: { backgroundColor: COLORS.paper, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  tabTxt: { color: COLORS.n600, fontWeight: "600", fontSize: 13 },
  tabTxtActive: { color: COLORS.primary },
  statRow: { flexDirection: "row", gap: SPACING.sm },
  stat: { flex: 1, padding: SPACING.md, borderRadius: RADII.md, borderWidth: 1, alignItems: "center" },
  statValue: { fontSize: 24, fontWeight: "800" },
  statLabel: { fontSize: 11, color: COLORS.n600, textTransform: "uppercase", letterSpacing: 1, marginTop: 2 },
  meta: { color: COLORS.n600, fontSize: 13, marginTop: 4 },
});
