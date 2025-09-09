import { Stack } from "expo-router";
import "../global.css";
// import { Text } from "react-native";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerTitle: "Aora", headerShown: false }}
      />
    </Stack>
  );
}
