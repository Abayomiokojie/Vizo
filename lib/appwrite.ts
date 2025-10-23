import Bookmarks from "@/app/(tabs)/bookmark";
import {
  Account,
  Client,
  ID,
  Query,
  Storage,
  TablesDB as Tables,
  Models,
  ImageGravity,
  ImageFormat,
} from "react-native-appwrite";

//  Configuration
export const appwriteConfig = {
  endpoint: "https://nyc.cloud.appwrite.io/v1",
  platform: "com.trails.vizo",
  projectId: "68c1a9c90019aca20ec8",
  databaseId: "68c35c6b001dd087c08a",
  userTableId: "68c35d2d002b63e60613",
  videoTableId: "68c35d380036a3b663ee",
  storageId: "68c360930012a2139483",
  bookmarkTableId: "bookmarks",
};

//  Initialize Appwrite Client
const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

const account = new Account(client);
const storage = new Storage(client);
const tables = new Tables(client);

//  TypeScript interfaces
export interface User extends Models.Document {
  accountId: string;
  email: string;
  username: string;
  avatar: string;
}

export interface VideoPost extends Models.Document {
  title: string;
  thumbnail: string;
  video: string;
  prompt: string;
  users: string;
  creator: User;
  bookmarkId?: string;
}

//  Auth — Create User
export async function createUser(
  email: string,
  password: string,
  username: string
) {
  try {
    const newAccount = await account.create({
      userId: ID.unique(),
      email,
      password,
      name: username,
    });
    if (!newAccount) throw new Error("Account creation failed");

    function initialsAvatarUrl(name: string, size = 128) {
      const safe = encodeURIComponent(name.trim());
      return `https://ui-avatars.com/api/?name=${safe}&size=${size}&background=111827&color=ffffff&rounded=true`;
    }

    // function initialsAvatarUrl(name: string, size = 128) {
    //   const safe = encodeURIComponent(name.trim());
    //   const url = `https://ui-avatars.com/api/?name=${safe}&size=${size}&background=111827&color=ffffff&rounded=true`;
    //   console.log("Generated avatar URL:", url);
    //   return url;
    // }

    let avatarUrl = initialsAvatarUrl(username);
    if (!avatarUrl || !avatarUrl.startsWith("http")) {
      avatarUrl = "https://www.gravatar.com/avatar/?d=mp";
    }

    // await signIn(email, password);

    const newUser = await tables.createRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.userTableId,
      rowId: newAccount.$id,
      data: {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
      },
    });

    return newUser;
  } catch (error: any) {
    throw new Error(error.message || "Failed to create user");
  }
}

//  Auth — Sign In
export async function signIn(email: string, password: string) {
  try {
    return await account.createEmailPasswordSession({ email, password });
  } catch (error: any) {
    throw new Error(error.message || "Sign-in failed");
  }
}

//  Auth — Get Account
export async function getAccount() {
  try {
    return await account.get();
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch account");
  }
}

//  Get Current User
export async function getCurrentUser(): Promise<User | null> {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) throw new Error("No current account found");

    const currentUser = await tables.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.userTableId,
      queries: [Query.equal("accountId", currentAccount.$id)],
    });

    if (!currentUser.rows.length) return null;
    return currentUser.rows[0] as unknown as User;
  } catch (error) {
    console.error(error);
    return null;
  }
}

//  Sign Out
export async function signOut() {
  try {
    return await account.deleteSession({ sessionId: "current" });
  } catch (error: any) {
    throw new Error(error.message || "Sign-out failed");
  }
}

//  Upload File
// export async function uploadFile(file: any, type: "image" | "video") {
//   if (!file) return null;

//   // const { mimeType, ...rest } = file;
//   // const asset = { type: mimeType, ...rest };

//   try {
//     const uploadedFile = await storage.createFile({
//       bucketId: appwriteConfig.storageId,
//       fileId: ID.unique(),
//       // file: asset,
//       file,
//     });

//     // Always return a full URL string
//     if (type === "video") {
//       return storage
//         .getFileView({
//           bucketId: appwriteConfig.storageId,
//           fileId: uploadedFile.$id,
//         })
//         .toString();
//     }

//     return storage
//       .getFilePreview({
//         bucketId: appwriteConfig.storageId,
//         fileId: uploadedFile.$id,
//         width: 2000,
//         height: 2000,
//         gravity: ImageGravity.Top,
//         quality: 100,
//         output: ImageFormat.Jpg,
//       })
//       .toString();
//   } catch (error: any) {
//     throw new Error(error.message || "File upload failed");
//   }
// }

// Helper: build a public URL for a file
function getFileUrl(fileId: string, type: "image" | "video"): string {
  const endpoint = appwriteConfig.endpoint; // e.g. "https://cloud.appwrite.io/v1"
  const bucketId = appwriteConfig.storageId;
  const projectId = appwriteConfig.projectId;

  if (type === "video") {
    return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
  }

  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
}

// Upload File and return a valid URL string
export async function uploadFile(
  file: any,
  type: "image" | "video"
): Promise<string> {
  if (!file) throw new Error("No file provided to upload");

  const uploadedFile = await storage.createFile({
    bucketId: appwriteConfig.storageId,
    fileId: ID.unique(),
    file,
  });

  // Build and return a proper https:// URL string
  return getFileUrl(uploadedFile.$id, type);
}

//  Get File Preview / View
export function getFilePreview(
  fileId: string,
  type: "image" | "video"
): string {
  if (type === "video") {
    return storage
      .getFileView({
        bucketId: appwriteConfig.storageId,
        fileId,
      })
      .toString();
  }

  return storage
    .getFilePreview({
      bucketId: appwriteConfig.storageId,
      fileId,
      width: 2000,
      height: 2000,
      gravity: ImageGravity.Top,
      quality: 100,
      output: ImageFormat.Jpg,
    })
    .toString();
}

//  Create Video Post
// export async function createVideoPost(form: {
//   title: string;
//   thumbnail: any;
//   video: any;
//   prompt: string;
//   userId: string;
// }) {
//   try {
//     const [thumbnailUrl, videoUrl] = await Promise.all([
//       uploadFile(form.thumbnail, "image"),
//       uploadFile(form.video, "video"),
//     ]);

//     return await tables.createRow({
//       databaseId: appwriteConfig.databaseId,
//       tableId: appwriteConfig.videoTableId,
//       rowId: ID.unique(),
//       data: {
//         title: form.title,
//         thumbnail: thumbnailUrl,
//         video: videoUrl,
//         prompt: form.prompt,
//         users: form.userId,
//       },
//     });
//   } catch (error: any) {
//     throw new Error(error.message || "Failed to create post");
//   }
// }

// Create Video Post with URL strings
export async function createVideoPost(form: {
  title: string;
  thumbnail: any;
  video: any;
  prompt: string;
  userId: string;
}) {
  const [thumbnailUrl, videoUrl] = await Promise.all([
    uploadFile(form.thumbnail, "image"),
    uploadFile(form.video, "video"),
  ]);

  // Debug log
  console.log("Thumbnail URL:", thumbnailUrl);
  console.log("Video URL:", videoUrl);

  return await tables.createRow({
    databaseId: appwriteConfig.databaseId,
    tableId: appwriteConfig.videoTableId,
    rowId: ID.unique(),
    data: {
      title: form.title,
      thumbnail: thumbnailUrl, // guaranteed string URL
      video: videoUrl, // guaranteed string URL
      prompt: form.prompt,
      users: form.userId,
    },
  });
}

//  Get all posts
// export async function getAllPosts(): Promise<VideoPost[]> {
//   try {
//     const posts = await tables.listRows({
//       databaseId: appwriteConfig.databaseId,
//       tableId: appwriteConfig.videoTableId,
//     });

//     return posts.rows as unknown as VideoPost[];
//   } catch (error: any) {
//     throw new Error(error.message || "Failed to fetch posts");
//   }
// }

export async function getAllPosts(): Promise<
  (VideoPost & { creator: User })[]
> {
  const posts = await tables.listRows({
    databaseId: appwriteConfig.databaseId,
    tableId: appwriteConfig.videoTableId,
    queries: [Query.orderDesc("$createdAt")],
  });

  const rows = await Promise.all(
    posts.rows.map(async (row: any) => {
      const user = await tables.getRow({
        databaseId: appwriteConfig.databaseId,
        tableId: appwriteConfig.userTableId,
        rowId: row.users, // foreign key
      });

      return {
        ...row,
        creator: user as unknown as User, // 👈 double cast
      };
    })
  );

  return rows;
}

///  Get user posts
export async function getUserPosts(userId: string): Promise<VideoPost[]> {
  try {
    const posts = await tables.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.videoTableId,
      queries: [Query.equal("users", userId)],
    });

    const withCreators = await Promise.all(
      posts.rows.map(async (row: any) => {
        const user = await tables.getRow({
          databaseId: appwriteConfig.databaseId,
          tableId: appwriteConfig.userTableId,
          rowId: row.users,
        });
        return { ...row, creator: user };
      })
    );

    return withCreators as VideoPost[];
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch user posts");
  }
}

export async function searchPosts(query: string): Promise<VideoPost[]> {
  if (!query.trim()) return [];

  try {
    // Try server-side fulltext search (requires fulltext index on "title")
    const posts = await tables.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.videoTableId,
      queries: [Query.search("title", query)],
    });

    // Normalize each row by fetching its creator
    const withCreators = await Promise.all(
      posts.rows.map(async (row: any) => {
        let creator: User | null = null;
        try {
          creator = (await tables.getRow({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.userTableId,
            rowId: row.users, // foreign key reference
          })) as unknown as User;
        } catch {
          // if user lookup fails, leave creator null
        }
        return { ...row, creator } as VideoPost;
      })
    );

    if (withCreators.length > 0) return withCreators;

    // Otherwise, fallback to substring filtering
    const allPosts = await tables.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.videoTableId,
    });

    const filtered = await Promise.all(
      allPosts.rows
        .filter((row: any) =>
          row.title.toLowerCase().includes(query.toLowerCase())
        )
        .map(async (row: any) => {
          let creator: User | null = null;
          try {
            creator = (await tables.getRow({
              databaseId: appwriteConfig.databaseId,
              tableId: appwriteConfig.userTableId,
              rowId: row.users,
            })) as unknown as User;
          } catch {}
          return { ...row, creator } as VideoPost;
        })
    );

    return filtered;
  } catch (error: any) {
    console.error("Search failed:", error.message);

    // As a fallback, fetch all and filter client-side
    const allPosts = await tables.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.videoTableId,
    });

    const filtered = await Promise.all(
      allPosts.rows
        .filter((row: any) =>
          row.title.toLowerCase().includes(query.toLowerCase())
        )
        .map(async (row: any) => {
          let creator: User | null = null;
          try {
            creator = (await tables.getRow({
              databaseId: appwriteConfig.databaseId,
              tableId: appwriteConfig.userTableId,
              rowId: row.users,
            })) as unknown as User;
          } catch {}
          return { ...row, creator } as VideoPost;
        })
    );

    return filtered;
  }
}

//  Latest posts
export async function getLatestPosts(): Promise<VideoPost[]> {
  try {
    const posts = await tables.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.videoTableId,
      queries: [Query.orderDesc("$createdAt"), Query.limit(7)],
    });

    return posts.rows as unknown as VideoPost[];
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch latest posts");
  }
}

//  Get bookmarked posts
export async function getBookmarkedPosts(userId: string): Promise<VideoPost[]> {
  const bookmarks = await tables.listRows({
    databaseId: appwriteConfig.databaseId,
    tableId: appwriteConfig.bookmarkTableId,
    queries: [Query.equal("userId", userId)],
  });

  const withVideos: VideoPost[] = await Promise.all(
    bookmarks.rows.map(async (row: any) => {
      const video = await tables.getRow({
        databaseId: appwriteConfig.databaseId,
        tableId: appwriteConfig.videoTableId,
        rowId: row.videoId,
      });

      const creator = (await tables.getRow({
        databaseId: appwriteConfig.databaseId,
        tableId: appwriteConfig.userTableId,
        rowId: video.users,
      })) as unknown as User;

      const videoPost: VideoPost = {
        $id: video.$id,
        $collectionId: video.$collectionId,
        $databaseId: video.$databaseId,
        $createdAt: video.$createdAt,
        $updatedAt: video.$updatedAt,
        $permissions: video.$permissions,
        $sequence: video.$sequence,

        title: video.title,
        thumbnail: video.thumbnail,
        video: video.video,
        prompt: video.prompt,
        users: video.users,
        creator,
        bookmarkId: row.$id,
      };

      return videoPost;
    })
  );

  return withVideos;
}

// Add a bookmark
export async function addBookmark(userId: string, videoId: string) {
  return await tables.createRow({
    databaseId: appwriteConfig.databaseId,
    tableId: appwriteConfig.bookmarkTableId,
    rowId: ID.unique(),
    // data: { userId, videoId },
    data: {
      userId: userId,
      videoId: videoId,
    },
  });
}

// Remove a bookmark
export async function removeBookmark(bookmarkId: string) {
  return await tables.deleteRow({
    databaseId: appwriteConfig.databaseId,
    tableId: appwriteConfig.bookmarkTableId,
    rowId: bookmarkId,
  });
}
