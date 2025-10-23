import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  getBookmarkedPosts,
  addBookmark as apiAddBookmark,
  removeBookmark as apiRemoveBookmark,
} from "../lib/appwrite";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        if (res) {
          setIsLogged(true);
          setUser(res);
          // Fetch bookmarks when user is logged in
          getBookmarkedPosts(res.$id).then(setBookmarks);
        } else {
          setIsLogged(false);
          setUser(null);
          setBookmarks([]);
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const toggleBookmark = async (post) => {
    const isBookmarked = bookmarks.some((b) => b.$id === post.$id);

    if (isBookmarked) {
      const bookmarkToRemove = bookmarks.find((b) => b.videoId === post.$id);
      // Optimistic update: remove from local state
      setBookmarks((prev) => prev.filter((b) => b.videoId !== post.$id));
      try {
        await apiRemoveBookmark(bookmarkToRemove.bookmarkId);
      } catch (error) { 
        // Revert if API call fails
        setBookmarks((prev) => [...prev, bookmarkToRemove]);
        console.error("Failed to remove bookmark:", error);
      }
    } else {
      // Optimistic update: add to local state
      const newBookmark = { ...post, videoId: post.$id, bookmarkId: `temp-${Date.now()}` };
      setBookmarks((prev) => [...prev, newBookmark]);
      try {
        const res = await apiAddBookmark(user.$id, post.$id);
        // Update the temporary bookmark with the real one from the API
        setBookmarks((prev) =>
          prev.map((b) => (b.bookmarkId === newBookmark.bookmarkId ? { ...b, bookmarkId: res.$id } : b))
        );
      } catch (error) {
        // Revert if API call fails
        setBookmarks((prev) => prev.filter((b) => b.bookmarkId !== newBookmark.bookmarkId));
        console.error("Failed to add bookmark:", error);
      }
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        setIsLogged,
        user,
        setUser,
        loading,
        bookmarks,
        toggleBookmark,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
