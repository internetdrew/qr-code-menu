import { expect, describe, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, MemoryRouter, Route, Routes } from "react-router";
import Login from "./Login";
import * as authContext from "@/contexts/auth";
import { supabaseBrowserClient } from "@/lib/supabase";
import "@testing-library/jest-dom";

vi.mock("@/contexts/auth");

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

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login page with title and description", () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      error: null,
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Welcome to MenuNook/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Sign in to create your online menu in minutes/i),
    ).toBeInTheDocument();
  });

  it("renders Google sign-in button", () => {
    vi.mocked(authContext.useAuth).mockReturnValue(noUserState);

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    );

    const button = screen.getByRole("button", {
      name: /Continue with Google/i,
    });
    expect(button).toBeInTheDocument();
  });

  it("calls signInWithOAuth when Google button is clicked", async () => {
    vi.mocked(authContext.useAuth).mockReturnValue(noUserState);

    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    );

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

  it("redirects to home when user is present", async () => {
    const mockUser = {
      id: "123",
      email: "test@example.com",
      app_metadata: {},
      user_metadata: {},
      aud: "public",
      created_at: "2024-01-01T00:00:00Z",
    };
    vi.mocked(authContext.useAuth).mockReturnValue({
      user: mockUser,
      isLoading: false,
      error: null,
    });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<div>Home Page, Baby!</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Home Page, Baby!")).toBeInTheDocument();
  });
});
