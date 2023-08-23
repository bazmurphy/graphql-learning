export type Game = {
  id: string;
  title: string;
  platform: string[];
};

export type Author = {
  id: string;
  name: string;
  verified: boolean;
};

export type Review = {
  id: string;
  rating: number;
  content: string;
  author_id: string;
  game_id: string;
};
