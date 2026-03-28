// --- Content Blocks (discriminated union) ---

export type ParagraphBlock = {
  type: "paragraph";
  text: string;
};

export type HeadingBlock = {
  type: "heading";
  level: 2 | 3;
  text: string;
};

export type BlockquoteBlock = {
  type: "blockquote";
  text: string;
};

export type UnorderedListBlock = {
  type: "unordered-list";
  items: string[];
};

export type OrderedListBlock = {
  type: "ordered-list";
  items: string[];
};

export type ImageBlock = {
  type: "image";
  src: string;
  alt: string;
  caption?: string;
};

export type ContentBlock =
  | ParagraphBlock
  | HeadingBlock
  | BlockquoteBlock
  | UnorderedListBlock
  | OrderedListBlock
  | ImageBlock;

// --- Data Models ---

export type Author = {
  name: string;
  avatar: string;
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: ContentBlock[];
  category: string;
  author: Author;
  image: string;
  publishedAt: string;
  featured: boolean;
  tags: string[];
};

export type BreakingNews = {
  id: string;
  headline: string;
  summary: string;
  articleId: string;
  category: string;
  publishedAt: string;
  urgent: boolean;
};

export type Category = {
  slug: string;
  name: string;
  articleCount: number;
};

export type Subscription = {
  token: string;
  status: "active" | "inactive";
  subscribedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

// --- API Response Envelopes ---

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type ApiResponse<T> = {
  success: true;
  data: T;
};

export type PaginatedResponse<T> = {
  success: true;
  data: T[];
  meta: {
    pagination: PaginationMeta;
  };
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};
