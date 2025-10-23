import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Image, FlatList, TouchableOpacity, Alert } from "react-native";

import { icons } from "../../constants";
import useAppwrite from "../../lib/useAppwrite";
import { getUserPosts, signOut, VideoPost } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import EmptyState from "@/components/EmptyState";
import VideoCard from "@/components/VideoCard";
import InfoBox from "@/components/InfoBox";
import { useState, useCallback } from "react";
import Loader from "@/components/Loader";

const Profile = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const memoizedGetUserPosts = useCallback(() => {
    if (user?.$id) {
      return getUserPosts(user.$id);
    }
    return Promise.resolve([]);
  }, [user?.$id]);

  const { data, loading } = useAppwrite(memoizedGetUserPosts);
  const posts: VideoPost[] = data ?? [];

  const logout = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await signOut();
          setUser(null);
          setIsLogged(false);
          router.replace("/sign-in");
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <VideoCard
            post={item}
            activeVideoId={activeVideoId}
            setActiveVideoId={setActiveVideoId}
          />
        )}
        ListEmptyComponent={() =>
          loading ? (
            <Loader isLoading={loading} />
          ) : (
            <EmptyState
              title="No Videos Found"
              subtitle="No videos found for this profile"
            />
          )
        }
        ListHeaderComponent={() => (
          <View className="w-full flex justify-center items-center mt-6 mb-12 px-4">
            <TouchableOpacity
              onPress={logout}
              className="flex w-full items-end mb-10"
            >
              <Image
                source={icons.logout}
                resizeMode="contain"
                className="w-6 h-6"
              />
            </TouchableOpacity>

            <View className="w-16 h-16 border border-secondary rounded-lg flex justify-center items-center">
              <Image
                source={{ uri: user?.avatar }}
                className="w-[90%] h-[90%] rounded-lg"
                resizeMode="cover"
              />
            </View>

            <InfoBox
              title={user?.username ?? "Anonymous"}
              containerStyles="mt-5"
              titleStyles="text-lg"
            />

            <View className="mt-5 flex flex-row">
              <InfoBox
                title={posts.length}
                subtitle="Posts"
                titleStyles="text-xl"
                containerStyles="mr-10"
              />
              <InfoBox
                title="1.2k"
                subtitle="Followers"
                titleStyles="text-xl"
              />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default Profile;
