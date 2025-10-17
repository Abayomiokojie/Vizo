import { useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import { View, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import useAppwrite from "../../lib/useAppwrite";
import { searchPosts, VideoPost } from "../../lib/appwrite";
import EmptyState from "@/components/EmptyState";
import SearchInput from "@/components/SearchInput";
import VideoCard from "@/components/VideoCard";

const Search = () => {
  const { query } = useLocalSearchParams();

  // Normalize query param
  const searchQuery =
    typeof query === "string" ? query : Array.isArray(query) ? query[0] : "";

  const { data: posts, refetch } = useAppwrite<VideoPost[]>(() =>
    searchPosts(searchQuery)
  );

  useEffect(() => {
    refetch();
  }, [searchQuery]);

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
              name: item.creator.username,
              avatar: item.creator.avatar,
            }}
            activeVideoId={null} // or lift state if you want playback control here
            setActiveVideoId={() => {}}
          />
        )}
        ListHeaderComponent={() => (
          <View className="flex my-6 px-4">
            <Text className="font-pmedium text-gray-100 text-sm">
              Search Results
            </Text>
            <Text className="text-2xl font-psemibold text-white mt-1">
              {searchQuery}
            </Text>

            <View className="mt-6 mb-8">
              <SearchInput initialQuery={searchQuery} />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="No videos found for this search query"
          />
        )}
      />
    </SafeAreaView>
  );
};

export default Search;
