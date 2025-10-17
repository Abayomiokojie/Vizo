// // to add in VideoCard
// import { addBookmark, removeBookmark } from "../lib/appwrite";
// import { useGlobalContext } from "../context/GlobalProvider";

// const VideoCard = ({
//   id,
//   title,
//   thumbnail,
//   video,
//   creator,
//   activeVideoId,
//   setActiveVideoId,
// }) => {
//   const { user } = useGlobalContext();
//   const [bookmarked, setBookmarked] = useState(false);
//   const [bookmarkId, setBookmarkId] = useState<string | null>(null);

//   const toggleBookmark = async () => {
//     try {
//       if (bookmarked && bookmarkId) {
//         await removeBookmark(bookmarkId);
//         setBookmarked(false);
//         setBookmarkId(null);
//       } else {
//         const res = await addBookmark(user.$id, id);
//         setBookmarked(true);
//         setBookmarkId(res.$id);
//       }
//     } catch (err) {
//       console.error("Bookmark toggle failed:", err);
//     }
//   };

//   return (
//     <View className="flex flex-row gap-3 items-start w-full">
//       {/* existing avatar + title code */}

//       <TouchableOpacity onPress={toggleBookmark}>
//         <Image
//           source={bookmarked ? icons.bookmarkFilled : icons.bookmarkOutline}
//           className="w-6 h-6"
//           resizeMode="contain"
//         />
//       </TouchableOpacity>
//     </View>
//   );
// };
