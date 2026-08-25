import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";
import { server } from "@/mocks/node";
import { createTrpcQueryHandler } from "@/utils/test/createTrpcQueryHandler";
import { renderApp } from "@/utils/test/renderApp";
import { authedUserState, noUserState } from "@/utils/test/userStates";
import {
  CATEGORY_DESCRIPTION_LIMIT,
  CATEGORY_NAME_LIMIT,
} from "../../shared/storeCategory";
import { USER_FEEDBACK_LIMIT } from "../../shared/userFeedback";
import "@/components/Onboarding";

afterEach(() => {
  vi.restoreAllMocks();
  setViewportWidth(1024);
});

const setViewportWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });
};

const store = {
  id: "11111111-1111-4111-8111-111111111111",
  created_at: "2026-01-01T00:00:00Z",
  image_path: null,
  image_url: null,
  is_published: false,
  menu_seo_description: "Fresh lunch favorites.",
  menu_seo_title: "Sunny Deli Menu",
  menu_slug: "sunny-deli",
  name: "Sunny Deli",
  user_id: "user-1",
};

const sandwichCategory = {
  id: 1,
  created_at: "2026-01-01T00:00:00Z",
  description: "Fresh lunch favorites.",
  name: "Sandwiches",
  order_index: 0,
  sort_index_id: 10,
  store_id: store.id,
  items: [
    {
      id: 101,
      created_at: "2026-01-01T00:00:00Z",
      description: "Turkey, lettuce, tomato, and house aioli.",
      image_path: null,
      image_url: null,
      is_available: true,
      name: "Turkey Club",
      order_index: 0,
      price: 12.5,
      sort_index_id: 1001,
      store_id: store.id,
      store_menu_category_id: 1,
    },
  ],
};

const createPreviewStore = (
  categories = [sandwichCategory],
  storeData = store,
) => ({
  ...storeData,
  store_menu_categories: categories,
});

const useStoreHandlers = ({
  categories = [sandwichCategory],
  isPublished = false,
  onFeedbackSubmit,
  onStoreUpdate,
}: {
  categories?: (typeof sandwichCategory)[];
  isPublished?: boolean;
  onFeedbackSubmit?: (feedback: string) => void;
  onStoreUpdate?: (input: unknown) => void;
} = {}) => {
  let currentCategories = categories;
  let currentStore = { ...store, is_published: isPublished };

  server.use(
    createTrpcQueryHandler({
      "store.getForUser": () => ({ result: { data: currentStore } }),
      "store.getPreview": () => ({
        result: { data: createPreviewStore(currentCategories, currentStore) },
      }),
      "store.update": (input) => {
        const values = input as { isPublished?: boolean };
        onStoreUpdate?.(input);

        currentStore = {
          ...currentStore,
          is_published: values.isPublished ?? currentStore.is_published,
        };

        return { result: { data: currentStore } };
      },
      "storeCategory.create": (input) => {
        const values = input as { name: string; description?: string };
        const createdCategory = {
          id: currentCategories.length + 1,
          created_at: "2026-01-01T00:00:00Z",
          description: values.description ?? "",
          name: values.name,
          order_index: currentCategories.length,
          sort_index_id: (currentCategories.length + 1) * 10,
          store_id: store.id,
          items: [],
        };

        currentCategories = [...currentCategories, createdCategory];

        return { result: { data: createdCategory } };
      },
      "storeCategoryItem.create": (input) => {
        const values = input as {
          name: string;
          description?: string;
          price: number;
          storeCategoryId: number;
        };
        const createdItem = {
          id: 202,
          created_at: "2026-01-01T00:00:00Z",
          description: values.description ?? "",
          image_path: null,
          image_url: null,
          is_available: true,
          name: values.name,
          order_index: 0,
          price: values.price,
          sort_index_id: 2002,
          store_id: store.id,
          store_menu_category_id: values.storeCategoryId,
        };

        currentCategories = currentCategories.map((category) =>
          category.id === values.storeCategoryId
            ? {
                ...category,
                items: [...category.items, createdItem],
              }
            : category,
        );

        return { result: { data: createdItem } };
      },
      "userFeedback.submit": (input) => {
        const values = input as { feedback: string };
        onFeedbackSubmit?.(values.feedback);

        return {
          result: {
            data: {
              id: 1,
              created_at: "2026-01-01T00:00:00Z",
              email: "owner@example.com",
              feedback: values.feedback,
              user_id: "user-1",
            },
          },
        };
      },
    }),
  );
};

describe("home route", () => {
  it("redirects signed-out visitors to login", async () => {
    renderApp({
      initialEntries: ["/"],
      authMock: noUserState,
    });

    expect(
      await screen.findByText("Let's get your menu out there."),
    ).toBeInTheDocument();
  });

  it("lets a signed-in owner begin store setup when they have no store", async () => {
    server.use(
      createTrpcQueryHandler({
        "store.getForUser": () => ({ result: { data: null } }),
      }),
    );

    renderApp({
      initialEntries: ["/"],
      authMock: authedUserState,
    });

    expect(
      await screen.findByRole("heading", { name: "Set up your store" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Store name")).toBeInTheDocument();
    expect(screen.getByLabelText("Public store link")).toBeInTheDocument();
    expect(screen.getByText("Permanent")).toBeInTheDocument();
    expect(
      screen.getByText("this public link cannot be changed after setup"),
    ).toBeInTheDocument();
  });

  it("lets a signed-in owner append a hyphenated suffix after a store link is taken", async () => {
    const user = userEvent.setup();
    let createdSlug = "";

    server.use(
      createTrpcQueryHandler({
        "store.getForUser": () => ({ result: { data: null } }),
        "store.checkSlugAvailability": (input) => {
          const values = input as { slug: string };

          if (values.slug === "sunny-deli") {
            return {
              result: {
                data: {
                  available: false,
                  slug: values.slug,
                  message: "That link is already taken.",
                },
              },
            };
          }

          return {
            result: {
              data: {
                available: true,
                slug: values.slug,
              },
            },
          };
        },
        "store.create": (input) => {
          const values = input as { name: string; slug: string };
          createdSlug = values.slug;

          return {
            result: {
              data: {
                ...store,
                name: values.name,
                menu_slug: values.slug,
              },
            },
          };
        },
      }),
    );

    renderApp({
      initialEntries: ["/"],
      authMock: authedUserState,
    });

    await user.type(await screen.findByLabelText("Store name"), "Sunny Deli");

    expect(
      await screen.findByText("That link is already taken."),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText("Public store link"), "-xyz");

    expect(screen.getByLabelText("Public store link")).toHaveValue(
      "sunny-deli-xyz",
    );
    expect(
      await screen.findByText(
        "Available: https://menunook.com/m/sunny-deli-xyz",
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(createdSlug).toBe("sunny-deli-xyz");
    expect(
      await screen.findByText("Sunny Deli created successfully."),
    ).toBeInTheDocument();
  });

  it("lets an owner preview the menu after creating a store", async () => {
    const user = userEvent.setup();
    useStoreHandlers();

    renderApp({
      initialEntries: ["/"],
      authMock: authedUserState,
    });

    await user.click(await screen.findByRole("link", { name: /preview/i }));

    expect(await screen.findByText("Turkey Club")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Sunny Deli" }),
    ).toBeInTheDocument();
  });

  it("lets an owner publish a store from the account menu", async () => {
    const user = userEvent.setup();
    let updateInput: unknown;
    useStoreHandlers({
      onStoreUpdate: (input) => {
        updateInput = input;
      },
    });

    renderApp({
      initialEntries: ["/"],
      authMock: authedUserState,
    });

    expect(
      await screen.findByLabelText("Menu status: Menu hidden"),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("link", { name: /preview/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /^view$/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /share/i }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open account menu" }));
    await user.click(screen.getByRole("menuitem", { name: "Menu Visibility" }));

    expect(
      await screen.findByRole("heading", { name: "Menu visibility" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Customers can't view your menu while it's hidden."),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("dialog", { name: "Menu visibility" })).getByText(
        "Hidden",
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Publish menu" }));

    await waitFor(() => {
      expect(updateInput).toMatchObject({
        id: store.id,
        isPublished: true,
      });
    });
    expect(
      await screen.findByRole("button", { name: /share/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByLabelText("Menu status: Menu live"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /^view$/i }),
    ).not.toBeInTheDocument();
  });

  it("keeps the public page dialog open when publishing fails", async () => {
    const user = userEvent.setup();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    useStoreHandlers();
    server.use(
      http.post("/trpc/store.update", () =>
        HttpResponse.json(
          {
            error: {
              message: "Publishing failed",
              code: -32603,
              data: {
                code: "INTERNAL_SERVER_ERROR",
                httpStatus: 500,
                path: "store.update",
              },
            },
          },
          { status: 500 },
        ),
      ),
    );

    renderApp({
      initialEntries: ["/"],
      authMock: authedUserState,
    });

    await user.click(
      await screen.findByRole("button", { name: "Open account menu" }),
    );
    await user.click(screen.getByRole("menuitem", { name: "Menu Visibility" }));
    await user.click(screen.getByRole("button", { name: "Publish menu" }));

    expect(
      await screen.findByRole("heading", { name: "Menu visibility" }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("dialog", { name: "Menu visibility" })).getByText(
        "Hidden",
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("link", { name: /preview/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /^view$/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /share/i }),
    ).not.toBeInTheDocument();
    expect(
      await screen.findByText("Failed to update publishing. Please try again."),
    ).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith(
      "Failed to update publishing:",
      expect.any(Error),
    );
    consoleError.mockRestore();
  });

  it("confirms before unpublishing a store from the account menu", async () => {
    const user = userEvent.setup();
    let updateInput: unknown;
    useStoreHandlers({
      isPublished: true,
      onStoreUpdate: (input) => {
        updateInput = input;
      },
    });

    renderApp({
      initialEntries: ["/"],
      authMock: authedUserState,
    });

    expect(
      await screen.findByLabelText("Menu status: Menu live"),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: /share/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /^view$/i }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open account menu" }));
    await user.click(screen.getByRole("menuitem", { name: "Menu Visibility" }));

    expect(
      await screen.findByRole("heading", { name: "Menu visibility" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Customers can view your live menu."),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("dialog", { name: "Menu visibility" })).getByText(
        "Live",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View live page" }),
    ).toHaveAttribute("href", "https://menunook.com/m/sunny-deli");

    await user.click(screen.getByRole("button", { name: "Unpublish menu" }));

    expect(
      await screen.findByRole("heading", { name: "Unpublish menu?" }),
    ).toBeInTheDocument();
    expect(updateInput).toBeUndefined();

    await user.click(screen.getByRole("button", { name: "Unpublish" }));

    await waitFor(() => {
      expect(updateInput).toMatchObject({
        id: store.id,
        isPublished: false,
      });
    });
    await waitFor(() => {
      expect(
        screen.getByRole("link", { name: /preview/i }),
      ).toBeInTheDocument();
    });
  });

  it("shows the empty categories state when a store has no categories", async () => {
    useStoreHandlers({ categories: [] });

    renderApp({
      initialEntries: ["/"],
      authMock: authedUserState,
    });

    expect(
      await screen.findByText("No categories created"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/You haven't created any item categories yet/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /expand sandwiches/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add Category" }),
    ).toBeInTheDocument();
  });

  it("keeps the menu loader visible until categories load", async () => {
    let resolvePreview: (
      storePreview: ReturnType<typeof createPreviewStore>,
    ) => void;
    const previewRequest = new Promise<ReturnType<typeof createPreviewStore>>(
      (resolve) => {
        resolvePreview = resolve;
      },
    );

    server.use(
      createTrpcQueryHandler({
        "store.getForUser": () => ({ result: { data: store } }),
        "store.getPreview": async () => ({
          result: { data: await previewRequest },
        }),
      }),
    );

    renderApp({
      initialEntries: ["/"],
      authMock: authedUserState,
    });

    expect(
      await screen.findByRole("status", { name: "Loading MenuNook" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Sunny Deli" })).toBeNull();
    expect(screen.queryByText("No categories created")).not.toBeInTheDocument();

    resolvePreview!(createPreviewStore([]));

    expect(
      await screen.findByRole("heading", { name: "Sunny Deli" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("No categories created"),
    ).toBeInTheDocument();
  });

  it("shows existing categories instead of the empty state", async () => {
    useStoreHandlers();

    renderApp({
      initialEntries: ["/"],
      authMock: authedUserState,
    });

    expect(
      await screen.findByRole("button", { name: /collapse sandwiches/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText("No categories created")).not.toBeInTheDocument();
  });

  it("lets an owner open store profile from the account menu", async () => {
    const user = userEvent.setup();
    useStoreHandlers();

    renderApp({
      initialEntries: ["/"],
      authMock: authedUserState,
    });

    await user.click(
      await screen.findByRole("button", { name: "Open account menu" }),
    );
    await user.click(screen.getByRole("menuitem", { name: "Store profile" }));

    expect(
      await screen.findByRole("heading", { name: "Store profile" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Store Name")).toHaveValue("Sunny Deli");
  });

  it("shows owner account actions from the header menu button", async () => {
    const user = userEvent.setup();
    useStoreHandlers();

    renderApp({
      initialEntries: ["/"],
      authMock: authedUserState,
    });

    await user.click(
      await screen.findByRole("button", { name: "Open account menu" }),
    );

    expect(
      screen.getByRole("menuitem", { name: "Menu Visibility" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Search Appearance" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Store profile" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: "Install app" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Send feedback" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /Log out/ }),
    ).toBeInTheDocument();
  });

  it("hides install actions when the app is already installed", async () => {
    const user = userEvent.setup();
    useStoreHandlers();

    vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
      matches: query === "(display-mode: standalone)",
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    }));

    renderApp({
      initialEntries: ["/"],
      authMock: authedUserState,
    });

    await user.click(
      await screen.findByRole("button", { name: "Open account menu" }),
    );

    expect(
      screen.queryByRole("menuitem", { name: "Install app" }),
    ).not.toBeInTheDocument();
  });

  it("explains how to install the app on mobile when no browser prompt is available", async () => {
    const user = userEvent.setup();
    setViewportWidth(390);
    useStoreHandlers();

    renderApp({
      initialEntries: ["/"],
      authMock: authedUserState,
    });

    await user.click(
      await screen.findByRole("button", { name: "Open account menu" }),
    );
    await user.click(screen.getByRole("menuitem", { name: "Install app" }));

    expect(
      await screen.findByRole("heading", {
        name: "Add MenuNook to your Home Screen",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "On iPhone or iPad, tap Share, choose Add to Home Screen, then tap Add.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "On Android, open the browser menu and choose Install app or Add to Home screen.",
      ),
    ).toBeInTheDocument();
  });

  it("uses the browser install prompt when it is available", async () => {
    const user = userEvent.setup();
    const prompt = vi.fn().mockResolvedValue(undefined);
    useStoreHandlers();

    renderApp({
      initialEntries: ["/"],
      authMock: authedUserState,
    });

    const installPromptEvent = new Event("beforeinstallprompt");
    Object.assign(installPromptEvent, {
      prompt,
      userChoice: Promise.resolve({ outcome: "dismissed", platform: "web" }),
    });

    await screen.findByRole("button", { name: "Open account menu" });
    act(() => {
      window.dispatchEvent(installPromptEvent);
    });
    await user.click(
      await screen.findByRole("button", { name: "Open account menu" }),
    );
    await waitFor(() => {
      expect(
        screen.getByRole("menuitem", { name: "Install app" }),
      ).toBeInTheDocument();
    });
    await user.click(screen.getByRole("menuitem", { name: "Install app" }));

    await waitFor(() => expect(prompt).toHaveBeenCalledTimes(1));
    expect(
      screen.queryByRole("heading", {
        name: "Add MenuNook to your Home Screen",
      }),
    ).not.toBeInTheDocument();
  });

  it("lets an owner open search appearance from the account menu", async () => {
    const user = userEvent.setup();
    useStoreHandlers();

    renderApp({
      initialEntries: ["/"],
      authMock: authedUserState,
    });

    await user.click(
      await screen.findByRole("button", { name: "Open account menu" }),
    );
    await user.click(
      screen.getByRole("menuitem", { name: "Search Appearance" }),
    );

    expect(
      await screen.findByRole("heading", { name: "Search Appearance" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Search Result Title")).toHaveValue(
      "Sunny Deli Menu",
    );
  });

  it("lets an owner send feedback from the account menu", async () => {
    const user = userEvent.setup();
    let submittedFeedback = "";
    useStoreHandlers({
      onFeedbackSubmit: (feedback) => {
        submittedFeedback = feedback;
      },
    });

    renderApp({
      initialEntries: ["/"],
      authMock: authedUserState,
    });

    await user.click(
      await screen.findByRole("button", { name: "Open account menu" }),
    );
    await user.click(screen.getByRole("menuitem", { name: "Send feedback" }));

    expect(
      await screen.findByRole("heading", { name: "Send feedback" }),
    ).toBeInTheDocument();

    const feedback =
      "The add item form was easy to find, but I expected the price field to explain whether customers see taxes included.";

    await user.type(screen.getByLabelText("Feedback"), feedback);
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(submittedFeedback).toBe(feedback);
    expect(
      await screen.findByText("Feedback sent. Thank you."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Send feedback" }),
    ).not.toBeInTheDocument();
  });

  it("caps feedback input at the shared limit", async () => {
    const user = userEvent.setup();
    useStoreHandlers();
    const longFeedback = [
      "When I am building the menu, I want the feedback form to accept enough detail about confusing category setup, item pricing, image uploads, and preview behavior.",
      "It should still stop before the message becomes too long for a quick product note.",
    ]
      .join(" ")
      .repeat(8);

    renderApp({
      initialEntries: ["/"],
      authMock: authedUserState,
    });

    await user.click(
      await screen.findByRole("button", { name: "Open account menu" }),
    );
    await user.click(screen.getByRole("menuitem", { name: "Send feedback" }));
    await user.click(screen.getByLabelText("Feedback"));
    await user.paste(longFeedback);

    expect(screen.getByLabelText("Feedback")).toHaveValue(
      longFeedback.slice(0, USER_FEEDBACK_LIMIT),
    );
    expect(screen.getByText("0 left")).toBeInTheDocument();
  });

  it("lets an owner add a new category to an existing store", async () => {
    const user = userEvent.setup();
    useStoreHandlers({ categories: [] });

    renderApp({
      initialEntries: ["/"],
      authMock: authedUserState,
    });

    await user.click(
      await screen.findByRole("button", { name: "Add Category" }),
    );
    await user.type(screen.getByLabelText("Category Name"), "Breakfast");
    await user.type(
      screen.getByLabelText("Category Description"),
      "Morning favorites.",
    );
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(
      await screen.findByRole("button", { name: /collapse breakfast/i }),
    ).toBeInTheDocument();
  });

  it("caps category name and description inputs at their shared limits", async () => {
    const user = userEvent.setup();
    useStoreHandlers({ categories: [] });
    const longCategoryName = "Weekend Brunch Specials and Morning Plates";
    const longCategoryDescription =
      "A rotating selection of breakfast sandwiches, pastries, fresh fruit, coffee drinks, and warm plates for guests who want something quick before work or a slower weekend meal.";

    renderApp({
      initialEntries: ["/"],
      authMock: authedUserState,
    });

    await user.click(
      await screen.findByRole("button", { name: "Add Category" }),
    );
    await user.type(screen.getByLabelText("Category Name"), longCategoryName);
    await user.type(
      screen.getByLabelText("Category Description"),
      longCategoryDescription,
    );

    expect(screen.getByLabelText("Category Name")).toHaveValue(
      longCategoryName.slice(0, CATEGORY_NAME_LIMIT),
    );
    expect(screen.getByLabelText("Category Description")).toHaveValue(
      longCategoryDescription.slice(0, CATEGORY_DESCRIPTION_LIMIT),
    );
    expect(screen.getAllByText("0 left")).toHaveLength(2);
  });

  it("lets an owner add a new item to an existing category", async () => {
    const user = userEvent.setup();
    useStoreHandlers({ categories: [{ ...sandwichCategory, items: [] }] });

    renderApp({
      initialEntries: ["/"],
      authMock: authedUserState,
    });

    await screen.findByRole("button", { name: /collapse sandwiches/i });
    await user.click(screen.getByRole("button", { name: "Add Item" }));

    expect(
      await screen.findByRole("heading", { name: "Add Item" }),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText("Item Name"), "Breakfast Burrito");
    await user.type(
      screen.getByLabelText("Item Description"),
      "Eggs, cheddar, salsa, wrapped warm and ready to go.",
    );
    await user.clear(screen.getByLabelText("Price"));
    await user.type(screen.getByLabelText("Price"), "9.756");

    expect(screen.getByLabelText("Price")).toHaveValue(9.75);

    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(await screen.findByText("Breakfast Burrito")).toBeInTheDocument();
    expect(screen.getByText("$9.75")).toBeInTheDocument();
  });
});
