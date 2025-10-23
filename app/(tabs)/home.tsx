import { useMemo, useState, useCallback } from "react";
import {
  NativeSyntheticEvent,
  NativeScrollEvent,
  SafeAreaView,
  FlatList,
  Image,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";

import { images } from "../../constants";
import useAppwrite from "../../lib/useAppwrite";
import { getAllPosts, getLatestPosts, VideoPost } from "../../lib/appwrite";
import EmptyState from "@/components/EmptyState";
import SearchInput from "@/components/SearchInput";
import Trending from "@/components/Trending";
import VideoCard from "@/components/VideoCard";
import { useGlobalContext } from "@/context/GlobalProvider";

const EMPTY_POSTS: VideoPost[] = [];

const Home = () => {
  const { user } = useGlobalContext();

  // const memoizedGetAllPosts = useCallback(() => getAllPosts(user?.$id), [user]);
  // const memoizedGetLatestPosts = useCallback(() => getLatestPosts(user?.$id), [user]);
  const memoizedGetAllPosts = useCallback(() => getAllPosts(), []);
  const memoizedGetLatestPosts = useCallback(() => getLatestPosts(), []);

  const { data: posts, refetch: refetchPosts } =
    useAppwrite(memoizedGetAllPosts);
  const { data: latestPosts, refetch: refetchLatest } = useAppwrite(
    memoizedGetLatestPosts
  );

  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isTrendingVisible, setIsTrendingVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchPosts();
    await refetchLatest();
    setRefreshing(false);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    setIsTrendingVisible(yOffset < headerHeight);
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 70,
  };

  const onViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: any[];
  }) => {
    const stillVisible = viewableItems.some(
      (v) => v.item.$id === activeVideoId
    );
    if (!stillVisible) {
      setActiveVideoId(null);
    }
  };

  const listHeader = useMemo(
    () => (
      <View
        className="flex my-6 px-4 space-y-6"
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      >
        <View className="flex justify-between items-start flex-row mb-6">
          <View>
            <Text className="font-pmedium text-sm text-gray-100">
              Welcome Back
            </Text>
            <Text className="text-2xl font-psemibold text-white">
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
          <Trending
            posts={latestPosts ?? EMPTY_POSTS}
            isTrendingVisible={isTrendingVisible}
          />
        </View>
      </View>
    ),
    [user, latestPosts, isTrendingVisible]
  );

  return (
    <SafeAreaView className="bg-primary h-full pt-8">
      <FlatList
        data={posts ?? []}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <VideoCard
            post={item}
            activeVideoId={activeVideoId}
            setActiveVideoId={setActiveVideoId}
          />
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        decelerationRate="fast"
        ListHeaderComponent={listHeader}
        onScroll={handleScroll}
        scrollEventThrottle={16}
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
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

export default Home;
