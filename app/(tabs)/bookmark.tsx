import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";

import { icons } from "../../constants";
import { useGlobalContext } from "../../context/GlobalProvider";
import EmptyState from "@/components/EmptyState";
import VideoCard from "@/components/VideoCard";

const Bookmarks = () => {
  const { bookmarks } = useGlobalContext();
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={bookmarks}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <VideoCard
            post={item}
            activeVideoId={activeVideoId}
            setActiveVideoId={setActiveVideoId}
          />
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Bookmarks Yet"
            subtitle="Save videos to your bookmarks and they’ll appear here."
          />
        )}
        ListHeaderComponent={() => (
          <View className="w-full flex justify-center items-center mt-6 mb-8 px-4">
            <View className="flex flex-row items-center justify-between w-full">
              <Text className="text-2xl font-psemibold text-white">
                Bookmarks
              </Text>
              <TouchableOpacity onPress={() => router.push("/home")}>
                <Image
                  source={icons.home}
                  resizeMode="contain"
                  className="w-6 h-6"
                />
              </TouchableOpacity>
            </View>
            <Text className="text-gray-100 mt-2 text-sm text-center">
              All your saved videos in one place
            </Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </SafeAreaView>
  );
};

export default Bookmarks;
