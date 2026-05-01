import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, Card, HeaderBar, Banner, Pill } from "../../src/ui";
import { COLORS, RADII, SPACING } from "../../src/theme";

export default function Done() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const s = await AsyncStorage.getItem("student");
      if (!s) { router.replace("/student/login"); return; }
      setData(JSON.parse(s));
    })();
  }, []);

  if (!data) return null;
  const result = data.result || data.test?.previous_attempt;
  const total = result?.total || data.test?.questions?.length || 0;
  const score = result?.score ?? 0;
  const pct = total ? Math.round((score / total) * 100) : 0;
  const auto = result?.auto_submit;
  const questions = data.result?.questions || data.test?.questions || [];
  const correct = data.result?.answers || result?.answers || {};
  const isReview = !!questions[0]?.options && questions[0]?.answer !== undefined;

  return (
    <SafeAreaView style={s.safe}>
      <HeaderBar
        title="✅ Test Submitted"
        subtitle={`${data.name} · ${data.student_class}`}
        right={<Button title="🏠 Home" variant="ghost" onPress={async () => { await AsyncStorage.removeItem("student"); router.replace("/"); }} testID="done-home-btn" />}
        testID="done-header"
      />
      <ScrollView contentContainerStyle={s.scroll}>
        <Card style={{ alignItems: "center", paddingVertical: SPACING.xl }}>
          <View style={[s.scoreCircle, { borderColor: pct >= 60 ? COLORS.success : COLORS.error }]}>
            <Text style={[s.scoreVal, { color: pct >= 60 ? COLORS.success : COLORS.error }]}>{pct}%</Text>
          </View>
          <Text style={s.scoreText}>{score} of {total} correct</Text>
          {auto && <Banner kind="warning" testID="auto-submit-warn">⚠️ Auto-submitted (tab switch / time over)</Banner>}
        </Card>

        {isReview && questions.length > 0 && (
          <View style={{ gap: SPACING.md }}>
            <Text style={{ fontWeight: "700", fontSize: 16, color: COLORS.n900, marginTop: SPACING.md }}>Question Review</Text>
            {questions.map((q: any, i: number) => {
              const my = correct[String(i)];
              const right = q.answer;
              const ok = my === right;
              return (
                <Card key={i} testID={`review-q-${i}`} style={{ borderLeftWidth: 4, borderLeftColor: ok ? COLORS.success : COLORS.error }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Pill color={ok ? COLORS.success : COLORS.error}>{ok ? "✓ Correct" : "✗ Wrong"}</Pill>
                    <Text style={{ color: COLORS.n600 }}>Q{i + 1}</Text>
                  </View>
                  <Text style={s.qReview}>{q.q}</Text>
                  {q.options.map((o: string, idx: number) => {
                    const isRight = idx === right;
                    const isMy = idx === my;
                    return (
                      <View key={idx} style={[s.optRow,
                        isRight && { backgroundColor: COLORS.success + "1a" },
                        isMy && !isRight && { backgroundColor: COLORS.error + "1a" },
                      ]}>
                        <Text style={{ color: isRight ? COLORS.success : isMy ? COLORS.error : COLORS.n800 }}>
                          {isRight ? "✓ " : isMy ? "✗ " : "○ "}{o}{isMy ? " (your answer)" : ""}
                        </Text>
                      </View>
                    );
                  })}
                </Card>
              );
            })}
          </View>
        )}

        <View style={{ flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.lg }}>
          <Button title="🗂 My History" variant="outline" onPress={() => router.push("/student/history")} testID="done-history-btn" style={{ flex: 1 }} />
          <Button title="🏠 Home" onPress={async () => { await AsyncStorage.removeItem("student"); router.replace("/"); }} testID="done-home-btn-2" style={{ flex: 1 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  scoreCircle: { width: 140, height: 140, borderRadius: 70, borderWidth: 6, alignItems: "center", justifyContent: "center" },
  scoreVal: { fontSize: 40, fontWeight: "800" },
  scoreText: { marginTop: SPACING.md, fontSize: 16, fontWeight: "600", color: COLORS.n800 },
  qReview: { fontSize: 15, fontWeight: "700", color: COLORS.n900, marginTop: 6 },
  optRow: { paddingVertical: 8, paddingHorizontal: SPACING.md, borderRadius: RADII.sm, marginTop: 4 },
});
