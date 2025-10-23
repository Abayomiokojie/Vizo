import { useEffect } from "react";
import { useVideoPlayer, VideoView } from "expo-video";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { icons } from "../constants";
import { useGlobalContext } from "../context/GlobalProvider";
import { VideoPost } from "../lib/appwrite";

interface VideoCardProps {
  post: VideoPost;
  activeVideoId: string | null;
  setActiveVideoId: (id: string | null) => void;
}

const VideoCard = ({
  post,
  activeVideoId,
  setActiveVideoId,
}: VideoCardProps) => {
  const { $id: id, title, creator, thumbnail, video } = post;
  const isActive = activeVideoId === id;
  const { toggleBookmark, bookmarks } = useGlobalContext();

  const isBookmarked = bookmarks.some((b: VideoPost) => b.$id === id);

  const player = useVideoPlayer(video, (p) => {
    p.loop = false;
  });

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player]);

  useEffect(() => {
    const sub = player.addListener("playToEnd", () => {
      setActiveVideoId(null);
    });
    return () => sub.remove();
  }, [player, setActiveVideoId]);

  return (
    <View className="flex flex-col items-center px-4 mb-14">
      <View className="flex flex-row gap-3 items-start w-full">
        <View className="flex justify-center items-center flex-row flex-1">
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary flex justify-center items-center p-0.5">
            {creator.avatar ? (
              <Image
                source={{ uri: creator.avatar }}
                className="w-full h-full rounded-lg"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full rounded-lg bg-gray-900" />
            )}
          </View>

          <View className="flex justify-center flex-1 ml-3 gap-y-1">
            <Text
              className="font-psemibold text-sm text-white"
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              className="text-xs text-gray-100 font-pregular"
              numberOfLines={1}
            >
              {creator.username}
            </Text>
          </View>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => toggleBookmark(post)}
            className="p-2 border border-slate-600 rounded-xl active:scale-110 origin-center active:bg-slate-100/60"
          >
            <Image
              source={
                isBookmarked ? icons.bookmarkFilled : icons.bookmarkOutline
              }
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <View className="pt-2">
          <Image source={icons.menu} className="w-5 h-5" resizeMode="contain" />
        </View>
      </View>

      <View className="w-full h-60 rounded-xl mt-3 relative overflow-hidden">
        <VideoView
          player={player}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          nativeControls
          allowsFullscreen
          allowsPictureInPicture
        />

        {!isActive && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveVideoId(id)}
            className="absolute inset-0 flex justify-center items-center bg-black/30"
          >
            {thumbnail ? (
              <Image
                source={{ uri: thumbnail }}
                className="absolute inset-0 w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full bg-gray-700 flex items-center justify-center">
                <Text className="text-white">No thumbnail</Text>
              </View>
            )}
            <Image
              source={icons.play}
              className="w-12 h-12"
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
      {/* <View className="flex items-start w-full mt-2">
        <TouchableOpacity
          onPress={() => toggleBookmark(post)}
          className="p-2 border border-slate-600 rounded-xl"
        >
          <Image
            source={isBookmarked ? icons.bookmarkFilled : icons.bookmarkOutline}
            className="w-6 h-6"
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View> */}
    </View>
  );
};

export default VideoCard;
