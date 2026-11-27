export type Post = {
  id: string;
  user_id: string | null;
  author_name: string;
  body: string | null;
  image_url: string | null;
  created_at: string;
};
