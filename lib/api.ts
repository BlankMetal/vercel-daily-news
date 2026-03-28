import type {
  Article,
  BreakingNews,
  Category,
  Subscription,
  ApiResponse,
  PaginatedResponse,
} from "./types";

const BASE_URL = process.env.API_BASE_URL!;
const BYPASS_TOKEN = process.env.API_BYPASS_TOKEN!;

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "x-vercel-protection-bypass": BYPASS_TOKEN,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

// --- Articles ---

export type GetArticlesParams = {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  featured?: boolean;
};

export async function getArticles(params?: GetArticlesParams) {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.category) searchParams.set("category", params.category);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.featured !== undefined)
    searchParams.set("featured", String(params.featured));

  const query = searchParams.toString();
  const path = `/articles${query ? `?${query}` : ""}`;

  const res = await apiFetch<PaginatedResponse<Article>>(path);
  return res;
}

export async function getArticle(idOrSlug: string) {
  const res = await apiFetch<ApiResponse<Article>>(
    `/articles/${encodeURIComponent(idOrSlug)}`
  );
  return res.data;
}

export async function getTrendingArticles(exclude?: string) {
  const query = exclude ? `?exclude=${encodeURIComponent(exclude)}` : "";
  const res = await apiFetch<ApiResponse<Article[]>>(
    `/articles/trending${query}`
  );
  return res.data;
}

// --- Breaking News ---

export async function getBreakingNews() {
  const res = await apiFetch<ApiResponse<BreakingNews>>("/breaking-news");
  return res.data;
}

// --- Categories ---

export async function getCategories() {
  const res = await apiFetch<ApiResponse<Category[]>>("/categories");
  return res.data;
}

// --- Subscription ---

export async function createSubscription(): Promise<{
  subscription: Subscription;
  token: string;
}> {
  const res = await fetch(`${BASE_URL}/subscription/create`, {
    method: "POST",
    headers: {
      "x-vercel-protection-bypass": BYPASS_TOKEN,
    },
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }

  const token = res.headers.get("x-subscription-token");
  if (!token) {
    throw new Error("No subscription token in response headers");
  }

  const body = (await res.json()) as ApiResponse<Subscription>;
  return { subscription: body.data, token };
}

export async function getSubscription(token: string) {
  const res = await apiFetch<ApiResponse<Subscription>>("/subscription", {
    headers: { "x-subscription-token": token },
  });
  return res.data;
}

export async function subscribe(token: string) {
  const res = await apiFetch<ApiResponse<Subscription>>("/subscription", {
    method: "POST",
    headers: { "x-subscription-token": token },
  });
  return res.data;
}

export async function unsubscribe(token: string) {
  const res = await apiFetch<ApiResponse<Subscription>>("/subscription", {
    method: "DELETE",
    headers: { "x-subscription-token": token },
  });
  return res.data;
}
