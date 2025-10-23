import { useEffect, useState } from "react";
import { useVideoPlayer, VideoView } from "expo-video";

import * as Animatable from "react-native-animatable";
import {
  FlatList,
  Image,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";

import { icons } from "../constants";
import { VideoPost } from "../lib/appwrite";

const zoomIn: Animatable.CustomAnimation<any> = {
  "0": { transform: [{ scale: 0.9 }] },
  "1": { transform: [{ scale: 1.1 }] },
};

const zoomOut: Animatable.CustomAnimation<any> = {
  "0": { transform: [{ scale: 1 }] },
  "1": { transform: [{ scale: 0.9 }] },
};

interface TrendingItemProps {
  activeItem: string | null;
  item: VideoPost;
}

const TrendingItem = ({ activeItem, item }: TrendingItemProps) => {
  const [playing, setPlaying] = useState(false);

  const player = useVideoPlayer(item.video, (p) => {
    p.loop = false;
  });

  // Consolidated effect for player events
  useEffect(() => {
    const subs = [
      player.addListener("statusChange", (event) => {
        if (event.status === "error") {
          console.error("Playback error:", event.error);
          setPlaying(false);
        }
      }),
      player.addListener("playToEnd", () => {
        setPlaying(false);
      }),
    ];

    return () => subs.forEach((s) => s.remove());
  }, [player]);

  // Consolidated effect for active item + play state
  useEffect(() => {
    if (activeItem !== item.$id) {
      // If this card is no longer active, stop playback
      setPlaying(false);
      player.pause();
      return;
    }

    if (playing) {
      player.play();
    } else {
      player.pause();
    }
  }, [activeItem, item.$id, playing, player]);

  return (
    <Animatable.View
      className="mx-5"
      animation={activeItem === item.$id ? zoomIn : zoomOut}
      duration={500}
    >
      <View className="w-52 h-72 rounded-[33px] my-5 overflow-hidden shadow-lg shadow-black/40 relative">
        <VideoView
          player={player}
          style={{ width: "100%", height: "100%" }}
          nativeControls={false}
          // nativeControls
          contentFit="cover"
        />

        {!playing && (
          <TouchableOpacity
            className="absolute inset-0 flex justify-center items-center bg-black/30"
            activeOpacity={0.7}
            onPress={() => setPlaying(true)}
          >
            <Image
              source={{ uri: item.thumbnail }}
              className="absolute inset-0 w-full h-full"
              resizeMode="cover"
            />
            <Image
              source={icons.play}
              className="w-12 h-12"
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
    </Animatable.View>
  );
};

interface TrendingProps {
  posts: VideoPost[];
}

const Trending = ({ posts }: TrendingProps) => {
  const [activeItem, setActiveItem] = useState<string | null>(
    posts.length > 0 ? posts[0].$id : null
  );

  const viewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: ViewToken[];
  }) => {
    if (viewableItems.length > 0) {
      const firstVisible = viewableItems[0].item as VideoPost;
      setActiveItem(firstVisible.$id);
    }
  };

  return (
    <FlatList
      data={posts}
      horizontal
      keyExtractor={(item) => item.$id}
      renderItem={({ item }) => (
        <TrendingItem activeItem={activeItem} item={item} />
      )}
      onViewableItemsChanged={viewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 70,
      }}
      contentOffset={{ x: 170, y: 170 }}
      // removeClippedSubviews={false}
      decelerationRate="fast"
      // snapToAlignment="center"
      showsHorizontalScrollIndicator={false}
      CellRendererComponent={({ index, style, children, ...rest }) => {
        const isActive = posts[index]?.$id === activeItem;
        return (
          <View
            {...rest}
            style={[
              style,
              {
                zIndex: isActive ? 10 : 1,
                elevation: isActive ? 10 : 1,
              },
            ]}
            renderToHardwareTextureAndroid
          >
            {children}
          </View>
        );
      }}
    />
  );
};

export default Trending;
