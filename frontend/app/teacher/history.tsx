import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Card, HeaderBar, Pill, Picker, SectionTitle, Banner } from "../../src/ui";
import { COLORS, SPACING } from "../../src/theme";
import { Api } from "../../src/api";

export default function TeacherHistory() {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [classFilter, setClassFilter] = useState("All");
  const [subjFilter, setSubjFilter] = useState("All");

  useEffect(() => {
    (async () => {
      const t = await AsyncStorage.getItem("teacher"); if (!t) { router.replace("/teacher/login"); return; }
      const tid = JSON.parse(t).id;
      const h = await Api.teacherHistory(tid).catch(() => []);
      setHistory(h);
    })();
  }, []);

  const classes = useMemo(() => ["All", ...Array.from(new Set(history.map((r) => r.test_class).filter(Boolean)))], [history]);
  const subjects = useMemo(() => ["All", ...Array.from(new Set(history.map((r) => r.subject).filter(Boolean)))], [history]);

  const filtered = history.filter((r) =>
    (classFilter === "All" || r.test_class === classFilter) &&
    (subjFilter === "All" || r.subject === subjFilter)
  );

  return (
    <SafeAreaView style={s.safe}>
      <HeaderBar title="🗂 Test History" subtitle={`${history.length} test(s) saved`} onBack={() => router.back()} testID="teacher-history-header" />
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={{ flexDirection: "row", gap: SPACING.sm }}>
          <View style={{ flex: 1 }}><Picker label="Class" value={classFilter} onChange={setClassFilter} options={classes} testID="hist-class-filter" /></View>
          <View style={{ flex: 1 }}><Picker label="Subject" value={subjFilter} onChange={setSubjFilter} options={subjects} testID="hist-subject-filter" /></View>
        </View>

        {filtered.length === 0 && <Banner>No tests match these filters yet.</Banner>}

        {filtered.map((r) => (
          <Card key={r.id} testID={`history-row-${r.id}`}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
              <Text style={{ fontWeight: "700", fontSize: 15 }}>{r.join_code}</Text>
              {r.test_class && <Pill>{r.test_class}</Pill>}
              {r.subject && <Pill color={COLORS.accent}>{r.subject}</Pill>}
            </View>
            <Text style={s.meta}>{new Date(r.date).toLocaleString()}</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: SPACING.sm }}>
              <Text style={{ color: COLORS.n700 }}>👥 {r.total_students} students</Text>
              <Text style={{ color: COLORS.success, fontWeight: "700" }}>📈 Avg {r.avg_score}/{r.questions.length}</Text>
            </View>
            {Object.keys(r.results || {}).length > 0 && (
              <View style={{ marginTop: SPACING.sm, gap: 4 }}>
                <SectionTitle style={{ fontSize: 13 }}>Students:</SectionTitle>
                {Object.entries(r.results).map(([name, res]: any) => (
                  <View key={name} style={s.studentRow}>
                    <Text style={{ flex: 1 }}>{name}</Text>
                    <Text style={{ fontWeight: "700", color: (res.score / res.total) >= 0.6 ? COLORS.success : COLORS.error }}>
                      {res.score}/{res.total}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.lg, gap: SPACING.md },
  meta: { color: COLORS.n600, fontSize: 12, marginTop: 4 },
  studentRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6, borderBottomWidth: 1, borderColor: COLORS.n100 },
});
