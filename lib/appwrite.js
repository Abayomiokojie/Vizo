import { Client, Avatars, Databases, Storage, Query, ID, Account, TablesDB } from "react-native-appwrite";

export const appwriteConfig = {
    endpoint: "https://nyc.cloud.appwrite.io/v1",
    platform: "com.trails.vizo",
    projectId: "68c1a9c90019aca20ec8",
    databaseId: "68c35c6b001dd087c08a",
    // userTableId: "68c35c7a5f1d4f5b0b1e",
    userTableId: "68c35d2d002b63e60613",
    // videoTableId: "68c35c8a4f1d4f5b0b1f",
    videoTableId: "68c35d380036a3b663ee",
    storageId: "68c360930012a2139483",
}

const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(appwriteConfig.platform);

export const account = new Account(client);
export const avatars = new Avatars(client);
export const databases = new Databases(client);
export const tablesDB = new TablesDB(client);
export const storage = new Storage(client);

// export const createUser = () => {
//     account.create(ID.unique(), "me@example.com", "password", "Jane Doe")
//         .then(function (response) {
//             console.log(response); // Success
//         }, function (error) {
//             console.log(error); // Failure
//         });
// }

// Register user
export async function createUser(email, password, username) {
    try {
        const newAccount = await account.create(ID.unique(), email, password, username);

        if (!newAccount) throw new Error("Account creation failed");

        const avatarUrl = avatars.getInitials(username).href || "https://www.gravatar.com/avatar/?d=mp";
        // console.log('Final Avatar URL:', avatarUrl, typeof avatarUrl);

        // let avatarUrl = avatars.getInitials(username);
        // if (!avatarUrl || typeof avatarUrl !== 'string' || !avatarUrl.startsWith('http')) {
        //     // Fallback to default URL (Gravatar or your own)
        //     avatarUrl = 'https://www.gravatar.com/avatar/?d=mp';
        // }


        // This project is using Appwrite Tables (SQL-like) for users, so we
        // create a row via the Tables API.
        const newUser = await tablesDB.createRow({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.userTableId,
            rowId: newAccount.$id,
            data: {
                accountId: newAccount.$id,
                email: email,
                username: username,
                avatar: avatarUrl,
            },
        });

        if (!newUser) throw new Error("User creation failed");


        return newUser;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

// Sign In
export async function signIn(email, password) {
    try {
        const session = await account.createEmailPasswordSession(email, password);
        return session;
    } catch (error) {
        throw new Error(error);
    }
}

// Get Current User
export async function getCurrentUser() {
    try {
        const currentAccount = await account.get();
        if (!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userTableId,
            [Query.equal("accountId", currentAccount.$id)]
        );

        if (!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (error) {
        console.log(error);
        return null;
    }
}