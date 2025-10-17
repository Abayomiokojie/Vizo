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
import { useState } from "react";

const Profile = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const { data } = useAppwrite(() => getUserPosts(user.$id));
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
            id={item.$id}
            title={item.title}
            thumbnail={item.thumbnail}
            video={item.video}
            creator={{
              name: item.creator?.username ?? "Unknown",
              avatar: item.creator?.avatar ?? "",
            }}
            // creator={{
            //   name: item.creator?.username ?? user?.username ?? "Unknown",
            //   avatar:
            //     item.creator?.avatar ??
            //     user?.avatar ??
            //     "https://www.gravatar.com/avatar/?d=mp",
            // }}
            activeVideoId={activeVideoId}
            setActiveVideoId={setActiveVideoId}
          />
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="No videos found for this profile"
          />
        )}
        ListHeaderComponent={() => (
          <View className="w-full flex justify-center items-center mt-6 mb-12 px-4">
            {/* Logout button */}
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

            {/* Avatar */}
            <View className="w-16 h-16 border border-secondary rounded-lg flex justify-center items-center">
              <Image
                source={{ uri: user?.avatar }}
                className="w-[90%] h-[90%] rounded-lg"
                resizeMode="cover"
              />
            </View>

            {/* Username */}
            <InfoBox
              title={user?.username ?? "Anonymous"}
              containerStyles="mt-5"
              titleStyles="text-lg"
            />

            {/* Stats */}
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
