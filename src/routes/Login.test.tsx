import { expect, describe, it, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { supabaseBrowserClient } from "@/lib/supabase";
import "@testing-library/jest-dom";
import { renderApp } from "@/utils/test/renderApp";

vi.mock("@/lib/supabase", () => {
  return {
    supabaseBrowserClient: {
      auth: {
        signInWithOAuth: vi.fn(),
      },
    },
  };
});

const noUserState = {
  user: null,
  isLoading: false,
  error: null,
};

const mockUser = {
  id: "123",
  email: "test@example.com",
  app_metadata: {},
  user_metadata: {
    name: "Test User",
  },
  aud: "public",
  created_at: "2024-01-01T00:00:00Z",
};

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login page with title and description", () => {
    renderApp({ initialEntries: ["/login"], authMock: noUserState });

    expect(screen.getByText(/Welcome to MenuNook/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Sign in to create your online menu in minutes/i),
    ).toBeInTheDocument();
  });

  it("renders Google sign-in button", () => {
    renderApp({ initialEntries: ["/login"], authMock: noUserState });

    const button = screen.getByRole("button", {
      name: /Continue with Google/i,
    });
    expect(button).toBeInTheDocument();
  });

  it("calls signInWithOAuth when Google button is clicked", async () => {
    const user = userEvent.setup();
    renderApp({ initialEntries: ["/login"], authMock: noUserState });

    const button = screen.getByRole("button", {
      name: /Continue with Google/i,
    });
    await user.click(button);

    expect(supabaseBrowserClient.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: expect.stringContaining("/auth/callback"),
      },
    });
  });

  it("redirects to home when user is present", () => {
    renderApp({
      initialEntries: ["/login"],
      authMock: {
        user: mockUser,
        isLoading: false,
        error: null,
      },
    });

    expect(screen.queryByText(/Welcome to MenuNook/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Continue with Google/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/MenuNook/i)).toBeInTheDocument();
  });
});
