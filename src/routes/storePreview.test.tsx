import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { server } from "@/mocks/node";
import { createTrpcQueryHandler } from "@/utils/test/createTrpcQueryHandler";
import { renderApp } from "@/utils/test/renderApp";
import { authedUserState } from "@/utils/test/userStates";
import type { StoreCategory } from "@/pages/StorePage";
import { toast } from "sonner";

const store = {
  id: "11111111-1111-4111-8111-111111111111",
  created_at: "2026-01-01T00:00:00Z",
  image_path: null,
  image_url: null,
  is_published: false,
  menu_seo_description: null,
  menu_seo_title: null,
  menu_slug: "sunny-deli",
  name: "Sunny Deli",
  user_id: "user-1",
};

type PreviewStore = typeof store & {
  store_menu_categories: StoreCategory[];
};

const previewStore: PreviewStore = {
  ...store,
  store_menu_categories: [
    {
      id: 1,
      created_at: "2026-01-01T00:00:00Z",
      description: "Fresh lunch favorites.",
      name: "Sandwiches",
      store_id: store.id,
      items: [
        {
          id: 101,
          created_at: "2026-01-01T00:00:00Z",
          description: "Turkey, lettuce, tomato, and house aioli.",
          image_path:
            "store/11111111-1111-4111-8111-111111111111/item/101/image.webp",
          image_url: "https://example.com/turkey-club.webp",
          name: "Turkey Club",
          order_index: 0,
          price: 12.5,
          store_id: store.id,
          store_menu_category_id: 1,
          updated_at: "2026-01-01T00:00:00Z",
        },
      ],
    },
  ],
};

describe("store preview route", () => {
  const usePreviewHandlers = (previewData = previewStore) => {
    server.use(
      createTrpcQueryHandler({
        "store.getForUser": () => ({ result: { data: store } }),
        "store.getPreview": () => ({ result: { data: previewData } }),
      }),
    );
  };

  it("shows the owner's preview with categories and items", async () => {
    usePreviewHandlers();

    renderApp({
      initialEntries: ["/preview/store"],
      authMock: authedUserState,
    });

    expect(
      await screen.findByRole(
        "heading",
        { name: "Sunny Deli" },
        { timeout: 3_000 },
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Sandwiches" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Turkey Club")).toBeInTheDocument();
    expect(
      screen.getByText("Your menu is hidden from customers."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Publish menu" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Open category menu" }),
    ).not.toBeInTheDocument();
  });

  it("shows the menu loader while the preview menu loads", async () => {
    let resolvePreview: (storePreview: PreviewStore) => void;
    const previewRequest = new Promise<PreviewStore>((resolve) => {
      resolvePreview = resolve;
    });

    server.use(
      createTrpcQueryHandler({
        "store.getForUser": () => ({ result: { data: store } }),
        "store.getPreview": async () => ({
          result: { data: await previewRequest },
        }),
      }),
    );

    renderApp({
      initialEntries: ["/preview/store"],
      authMock: authedUserState,
    });

    expect(
      await screen.findByRole("status", { name: "Loading MenuNook" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Sunny Deli" })).toBeNull();

    resolvePreview!(previewStore);

    expect(
      await screen.findByRole("heading", { name: "Sunny Deli" }),
    ).toBeInTheDocument();
  });

  it("lets an owner publish the menu from the preview banner", async () => {
    const user = userEvent.setup();
    const toastSuccess = vi.spyOn(toast, "success");
    let updateInput: unknown;
    let currentStore = { ...store };
    let currentPreviewStore = { ...previewStore };

    server.use(
      createTrpcQueryHandler({
        "store.getForUser": () => ({ result: { data: currentStore } }),
        "store.getPreview": () => ({
          result: { data: currentPreviewStore },
        }),
        "store.update": (input) => {
          const values = input as { isPublished?: boolean };
          updateInput = input;
          currentStore = {
            ...currentStore,
            is_published: values.isPublished ?? currentStore.is_published,
          };
          currentPreviewStore = {
            ...currentPreviewStore,
            is_published:
              values.isPublished ?? currentPreviewStore.is_published,
          };

          return { result: { data: currentStore } };
        },
      }),
    );

    renderApp({
      initialEntries: ["/preview/store"],
      authMock: authedUserState,
    });

    await user.click(
      await screen.findByRole("button", { name: "Publish menu" }),
    );

    expect(
      await screen.findByRole("heading", { name: "Menu visibility" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Preview" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Publish menu" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Publish menu" }));

    await waitFor(() => {
      expect(updateInput).toMatchObject({
        id: store.id,
        isPublished: true,
      });
    });
    expect(
      await screen.findByText("This is a preview of your live menu."),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("link", { name: "Visit live menu" }),
    ).toHaveAttribute("href", "https://menunook.com/m/sunny-deli");
    expect(toastSuccess).toHaveBeenCalledWith(
      "Sunny Deli is now live.",
      expect.objectContaining({
        action: expect.objectContaining({
          label: "View live menu",
        }),
      }),
    );
  });

  it("lets an owner inspect an item image from the preview", async () => {
    const user = userEvent.setup();
    usePreviewHandlers();

    renderApp({
      initialEntries: ["/preview/store"],
      authMock: authedUserState,
    });

    await user.click(
      await screen.findByRole("button", {
        name: "Open larger image for Turkey Club",
      }),
    );

    const imageDialog = await screen.findByRole("dialog", {
      name: "Turkey Club image",
    });

    expect(
      within(imageDialog).getByRole("img", { name: "Turkey Club" }),
    ).toBeInTheDocument();
  });

  it("does not show an image button for items without images", async () => {
    usePreviewHandlers({
      ...previewStore,
      store_menu_categories: [
        {
          ...previewStore.store_menu_categories[0],
          items: [
            {
              ...previewStore.store_menu_categories[0].items[0],
              image_path: null,
              image_url: null,
            },
          ],
        },
      ],
    });

    renderApp({
      initialEntries: ["/preview/store"],
      authMock: authedUserState,
    });

    expect(await screen.findByText("Turkey Club")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: "Open larger image for Turkey Club",
      }),
    ).not.toBeInTheDocument();
  });

  it("lets an owner open the category menu and jump to another category", async () => {
    const user = userEvent.setup();
    const scrollIntoView = vi.fn();
    Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });

    usePreviewHandlers({
      ...previewStore,
      store_menu_categories: [
        previewStore.store_menu_categories[0],
        {
          id: 2,
          created_at: "2026-01-01T00:00:00Z",
          description: "Lighter options.",
          name: "Salads",
          store_id: store.id,
          items: [
            {
              id: 201,
              created_at: "2026-01-01T00:00:00Z",
              description: "Greens, cucumber, tomato, and vinaigrette.",
              image_path: null,
              image_url: null,
              name: "House Salad",
              order_index: 0,
              price: 9,
              store_id: store.id,
              store_menu_category_id: 2,
              updated_at: "2026-01-01T00:00:00Z",
            },
          ],
        },
      ],
    });

    renderApp({
      initialEntries: ["/preview/store"],
      authMock: authedUserState,
    });

    await user.click(
      await screen.findByRole("button", { name: "Open category menu" }),
    );

    await user.click(await screen.findByRole("menuitem", { name: "Salads" }));

    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "start",
      });
    });
    expect(
      screen.getByRole("button", { name: "Open category menu" }),
    ).toBeInTheDocument();
  });

  it("redirects the old preview path to the store preview", async () => {
    usePreviewHandlers();

    renderApp({
      initialEntries: ["/preview"],
      authMock: authedUserState,
    });

    expect(
      await screen.findByRole("heading", { name: "Sunny Deli" }),
    ).toBeInTheDocument();
  });

  it("links published store previews to the public menu slug URL", async () => {
    const publishedStore = { ...store, is_published: true };
    const publishedPreviewStore = {
      ...previewStore,
      is_published: true,
    };

    server.use(
      createTrpcQueryHandler({
        "store.getForUser": () => ({ result: { data: publishedStore } }),
        "store.getPreview": () => ({
          result: { data: publishedPreviewStore },
        }),
      }),
    );

    renderApp({
      initialEntries: ["/preview/store"],
      authMock: authedUserState,
    });

    expect(
      await screen.findByText("This is a preview of your live menu."),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("link", { name: "Visit live menu" }),
    ).toHaveAttribute("href", "https://menunook.com/m/sunny-deli");
  });

  it("does not expose the old public menu route in the app", async () => {
    renderApp({
      initialEntries: ["/m/sunny-deli"],
      authMock: authedUserState,
    });

    expect(
      await screen.findByRole("heading", { name: "Page Not Found" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Turkey Club")).not.toBeInTheDocument();
  });
});
