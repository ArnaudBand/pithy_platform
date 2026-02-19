const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";


class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers);
  // Ensure Content-Type defaults to application/json if not already set
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Add auth token if available
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || `Request failed with status ${response.status}`,
        response.status,
        data
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Network error occurred",
      0
    );
  }
}

// Auth API
export const authApi = {
  register: async (email: string, password: string) => {
    return apiRequest("/users/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  login: async (email: string, password: string) => {
    return apiRequest<{
      id: string;
      email: string;
      token: string;
      createdAt: string;
      lastLoginAt: string;
    }>("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  verifyEmail: async (token: string) => {
    return apiRequest(`/users/verify?token=${encodeURIComponent(token)}`, {
      method: "GET",
    });
  },

  resendVerification: async (email: string) => {
    return apiRequest(`/users/resend-verification?email=${encodeURIComponent(email)}`, {
      method: "POST",
    });
  },

  forgotPassword: async (email: string) => {
    return apiRequest(`/users/forgot-password?email=${encodeURIComponent(email)}`, {
      method: "POST",
    });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return apiRequest("/users/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  },

  changePassword: async (userId: string, oldPassword: string, newPassword: string) => {
    return apiRequest(`/users/${userId}/change-password`, {
      method: "PUT",
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  },

  getUserById: async (userId: string) => {
    return apiRequest<{
      id: string;
      email: string;
      createdAt: string;
    }>(`/users/${userId}`, {
      method: "GET",
    });
  },

  getUserByEmail: async (email: string) => {
    return apiRequest<{
      id: string;
      email: string;
      createdAt: string;
    }>(`/users/email/${email}`, {
      method: "GET",
    });
  },

  updateUser: async (userId: string, email: string) => {
    return apiRequest(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify({ email }),
    });
  },

  deleteUser: async (userId: string) => {
    return apiRequest(`/users/${userId}`, {
      method: "DELETE",
    });
  },
};

// Export the error class for error handling
export { ApiError };

// Helper function to check if error is an ApiError
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

// Helper function to get error message
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}