/**
 * Utility to construct full media URLs from relative paths stored in the database.
 * Derives the base URL from the API URL provided in environment variables.
 */
export const getImageUrl = (path) => {
  if (!path) return "";
  
  // If it's already a full URL (http:// or https://), return it as is
  if (typeof path === 'string' && (path.startsWith("http://") || path.startsWith("https://"))) {
    return path;
  }

  // Get API URL from env and determine backend root
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/v1/";
  
  // baseUrl should be the root (e.g., http://localhost:8000)
  let baseUrl = apiUrl;
  if (baseUrl.includes("/v1")) {
    baseUrl = baseUrl.split("/v1")[0];
  }

  // Clean trailing slashes from base and leading slashes from path
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${cleanBase}${cleanPath}`;
};

/**
 * Fallback image for broken icons or feature images
 */
export const fallbackImage = "https://placehold.co/600x400?text=No+Image";
export const fallbackIcon = "https://placehold.co/100x100?text=Icon";
