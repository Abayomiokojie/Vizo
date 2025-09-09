import { Link } from "expo-router";
import { StatusBar, Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-3xl font-pblack">Vizo!</Text>
      <StatusBar barStyle="dark-content" backgroundColor="black" />
      <Link href="/home" className="text-blue-700">
        Home
      </Link>
    </View>
  );
}
