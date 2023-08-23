export type GameType = {
  id: string;
  title: string;
  platform: string[];
};

export type AuthorType = {
  id: string;
  name: string;
  verified: boolean;
};

export type ReviewType = {
  id: string;
  rating: number;
  content: string;
  author_id: string;
  game_id: string;
};

export type GameIdType = {
  id: string;
};

export type AddGamePropsType = {
  game: {
    title: string;
    platform: string[];
  };
};

export type UpdateGamePropsType = {
  id: string;
  updates: {
    title?: string;
    platform?: string[];
  };
};
