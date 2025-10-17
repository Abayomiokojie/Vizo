import { useVideoPlayer, VideoView } from "expo-video";
import { View } from "react-native";

export default function TestVideo() {
  const player = useVideoPlayer(
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    (p) => {
      p.loop = false;
    }
  );

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <VideoView
        player={player}
        style={{ width: 320, height: 180 }}
        nativeControls
      />
    </View>
  );
}
