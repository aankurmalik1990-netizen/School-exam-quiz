import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, Card, HeaderBar, Banner, Pill } from "../../src/ui";
import { COLORS, RADII, SPACING } from "../../src/theme";

export default function StudentReview() {
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
  const test = data.test || {};
  const questions = test.questions || [];

  return (
    <SafeAreaView style={s.safe}>
      <HeaderBar
        title="📖 Answer Review"
        subtitle={`${test.test_class} · ${test.subject}`}
        onBack={async () => { await AsyncStorage.removeItem("student"); router.replace("/"); }}
        testID="review-header"
      />
      <ScrollView contentContainerStyle={s.scroll}>
        <Banner kind="info">🔒 This test has ended. Answers are now public for review.</Banner>
        {questions.map((q: any, i: number) => (
          <Card key={i} testID={`review-q-${i}`}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Pill>Q{i + 1}</Pill>
            </View>
            <Text style={s.q}>{q.q}</Text>
            {q.options.map((o: string, idx: number) => (
              <View key={idx} style={[s.opt, idx === q.answer && { backgroundColor: COLORS.success + "1a" }]}>
                <Text style={{ color: idx === q.answer ? COLORS.success : COLORS.n800, fontWeight: idx === q.answer ? "700" : "400" }}>
                  {idx === q.answer ? "✓ " : "○ "}{o}
                </Text>
              </View>
            ))}
          </Card>
        ))}
        <Button title="🏠 Back to Home" onPress={async () => { await AsyncStorage.removeItem("student"); router.replace("/"); }} testID="review-home-btn" style={{ marginTop: SPACING.md }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.lg, gap: SPACING.md },
  q: { fontSize: 16, fontWeight: "700", color: COLORS.n900, marginTop: 6 },
  opt: { paddingVertical: 8, paddingHorizontal: SPACING.md, borderRadius: RADII.sm, marginTop: 4 },
});
