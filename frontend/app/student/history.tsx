import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Card, HeaderBar, Banner, Pill, Picker } from "../../src/ui";
import { COLORS, RADII, SPACING } from "../../src/theme";
import { Api } from "../../src/api";

export default function StudentHistory() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem("student");
      if (!stored) { router.replace("/student/login"); return; }
      const s = JSON.parse(stored);
      const h = await Api.studentHistory(s.name, s.student_class).catch(() => []);
      setItems(h);
    })();
  }, []);

  const subjects = useMemo(() => ["All", ...Array.from(new Set(items.map((r) => r.subject).filter(Boolean)))], [items]);
  const filtered = items.filter((r) => filter === "All" || r.subject === filter);

  return (
    <SafeAreaView style={s.safe}>
      <HeaderBar title="🗂 My Test History" subtitle={`${items.length} attempt(s)`} onBack={() => router.back()} testID="student-history-header" />
      <ScrollView contentContainerStyle={s.scroll}>
        <Picker label="Filter by subject" value={filter} onChange={setFilter} options={subjects} testID="hist-subject-filter" />
        {filtered.length === 0 && <Banner>No attempts yet.</Banner>}
        {filtered.map((r) => {
          const pct = Math.round((r.score / r.total) * 100);
          const isOpen = open === r.id;
          return (
            <Card key={r.id} testID={`student-hist-row-${r.id}`}>
              <TouchableOpacity onPress={() => setOpen(isOpen ? null : r.id)} activeOpacity={0.85}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ flex: 1, gap: 6 }}>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                      <Text style={{ fontWeight: "700", fontSize: 15 }}>{r.join_code}</Text>
                      {r.subject && <Pill color={COLORS.accent}>{r.subject}</Pill>}
                      {r.test_class && <Pill>{r.test_class}</Pill>}
                      {r.auto_submit && <Pill color={COLORS.warning}>auto</Pill>}
                    </View>
                    <Text style={s.meta}>{new Date(r.date).toLocaleString()}</Text>
                  </View>
                  <Text style={{ fontSize: 22, fontWeight: "800", color: pct >= 60 ? COLORS.success : COLORS.error }}>
                    {r.score}/{r.total}
                  </Text>
                </View>
              </TouchableOpacity>
              {isOpen && (
                <View style={{ marginTop: SPACING.md, gap: 8 }}>
                  {r.questions.map((q: any, i: number) => {
                    const my = r.answers[String(i)];
                    const ok = my === q.answer;
                    return (
                      <View key={i} style={[s.qBox, { borderLeftColor: ok ? COLORS.success : COLORS.error }]}>
                        <Text style={{ fontWeight: "700" }}>Q{i + 1}. {q.q}</Text>
                        {q.options.map((o: string, idx: number) => (
                          <Text key={idx} style={{ color: idx === q.answer ? COLORS.success : idx === my ? COLORS.error : COLORS.n700, marginTop: 2 }}>
                            {idx === q.answer ? "✓ " : idx === my ? "✗ " : "○ "}{o}
                          </Text>
                        ))}
                      </View>
                    );
                  })}
                </View>
              )}
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.lg, gap: SPACING.md },
  meta: { color: COLORS.n600, fontSize: 12 },
  qBox: { padding: SPACING.md, backgroundColor: COLORS.muted, borderRadius: RADII.md, borderLeftWidth: 4 },
});
