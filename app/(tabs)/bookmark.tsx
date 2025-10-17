import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, FlatList, Text, Image, TouchableOpacity } from "react-native";
import { router } from "expo-router";

import { icons } from "../../constants";
import useAppwrite from "../../lib/useAppwrite";
import { getBookmarkedPosts, VideoPost } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import EmptyState from "@/components/EmptyState";
import VideoCard from "@/components/VideoCard";

const Bookmarks = () => {
  const { user } = useGlobalContext();

  // Fetch bookmarked posts for this user
  const { data } = useAppwrite(() => getBookmarkedPosts(user.$id));
  const posts: VideoPost[] = data ?? [];

  // Track which video is active
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <VideoCard
            id={item.$id}
            title={item.title}
            thumbnail={item.thumbnail}
            video={item.video}
            creator={{
              name: item.creator?.username ?? "Unknown",
              avatar: item.creator?.avatar ?? "",
            }}
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
