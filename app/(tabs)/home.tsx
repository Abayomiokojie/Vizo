import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, Image, RefreshControl, Text, View } from "react-native";

import { images } from "../../constants";
import useAppwrite from "../../lib/useAppwrite";
import { getAllPosts, getLatestPosts, VideoPost } from "../../lib/appwrite";
import EmptyState from "@/components/EmptyState";
import SearchInput from "@/components/SearchInput";
import Trending from "@/components/Trending";
import VideoCard from "@/components/VideoCard";
import { useGlobalContext } from "@/context/GlobalProvider";
// import TestVideo from "@/components/VideoTest";

const Home = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();
  const { data: posts, refetch } = useAppwrite<VideoPost[]>(getAllPosts);
  const { data: latestPosts } = useAppwrite<VideoPost[]>(getLatestPosts);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 70, // consider visible if 70% is on screen
  };

  const onViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: any[];
  }) => {
    // If the current active video is no longer visible, pause it
    const stillVisible = viewableItems.some(
      (v) => v.item.$id === activeVideoId
    );

    if (!stillVisible) {
      setActiveVideoId(null);
    }
  };

  return (
    <SafeAreaView className="bg-primary">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <VideoCard
            id={item.$id}
            title={item.title}
            creator={{
              name: item.creator?.username ?? "Unknown",
              avatar: item.creator?.avatar ?? "",
            }}
            // creator={{
            //   name: item.creator.username,
            //   avatar: item.creator.avatar,
            // }}
            thumbnail={item.thumbnail}
            video={item.video}
            activeVideoId={activeVideoId}
            setActiveVideoId={setActiveVideoId}
          />
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        // snapToInterval={220}
        // decelerationRate="fast"
        ListHeaderComponent={() => (
          <View className="flex my-6 px-4 space-y-6">
            <View className="flex justify-between items-start flex-row mb-6">
              <View>
                <Text className="font-pmedium text-sm text-gray-100">
                  Welcome Back
                </Text>
                <Text className="text-2xl font-psemibold text-white">
                  {/* Kinger123 */}
                  {user?.username ?? "Anonymous"}
                </Text>
              </View>

              <View className="mt-1.5">
                <Image
                  source={images.logoSmall}
                  className="w-9 h-10"
                  resizeMode="contain"
                />
              </View>
            </View>

            <SearchInput />

            <View className="w-full flex-1 pt-5 pb-8">
              <Text className="text-lg font-pregular text-gray-100 mb-3">
                Latest Videos
              </Text>
              {/* <TestVideo /> */}

              <Trending posts={latestPosts ?? []} />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="No videos created yet"
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

export default Home;
