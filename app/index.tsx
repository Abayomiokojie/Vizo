import { Link } from "expo-router";
import { StatusBar, Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Vizo.</Text>
      <StatusBar barStyle="dark-content" backgroundColor="black" />
      <Link href="/profile" className="text-blue-500 text-5xl font-bold">
        Go to Profile
      </Link>
    </View>
  );
}
