const mockUser = {
  id: "123",
  email: "test@example.com",
  app_metadata: {},
  user_metadata: {
    name: "Mock User",
  },
  aud: "public",
  created_at: "2024-01-01T00:00:00Z",
};

export const noUserState = {
  user: null,
  isLoading: false,
  error: null,
};

export const authedUserState = {
  user: mockUser,
  isLoading: false,
  error: null,
};
