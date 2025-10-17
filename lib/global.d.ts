export default interface Post {
  $id: string;
  title: string;
  thumbnail: string;
  video?: string;
  creator?: {
    username: string;
    avatar: string;
  };
}
