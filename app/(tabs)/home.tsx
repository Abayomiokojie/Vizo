import { FlatList, Text, View } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchInput from "@/components/SearchInput";

const Home = () => {
  return (
    <SafeAreaView className="bg-white h-full">
      <FlatList
        // data={posts}
        data={[{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]}
        keyExtractor={(item) => item.id.toString()}
        // keyExtractor={(item) => item.$id}
        renderItem={({ item }) => <Text className=" text-4xl">{item.id}</Text>}
        ListHeaderComponent={() => (
          <View className="flex my-6 px-4 space-y-6">
            <View className="flex justify-between items-start flex-row mb-6">
              <View>
                <Text className="font-pmedium text-sm text-gray-700">
                  Welcome Back
                </Text>
                <Text className="text-2xl font-psemibold text-white">
                  Kinger
                </Text>
              </View>

              <View className="mt-1.5">
                {/* <Image
                  source={images.logoSmall}
                  className="w-9 h-10"
                  resizeMode="contain"
                /> */}
              </View>
            </View>

            <SearchInput initialQuery="" />

            <View className="w-full flex-1 pt-5 pb-8">
              <Text className="text-lg font-pregular text-gray-100 mb-3">
                Latest Videos
              </Text>

              {/* <Trending posts={latestPosts ?? []} /> */}
            </View>
          </View>
        )}
        // ListEmptyComponent={() => (
        //   <EmptyState
        //     title="No Videos Found"
        //     subtitle="No videos created yet"
        //   />
        // )}
        // refreshControl={
        //   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        // }
      />

      <StatusBar backgroundColor="#FFFFFF" style="dark" />
    </SafeAreaView>
  );
};

export default Home;
