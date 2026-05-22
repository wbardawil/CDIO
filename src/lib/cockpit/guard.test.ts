import { describe, it, expect, vi, beforeEach } from "vitest";

const { authMock, getInitiativeMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  getInitiativeMock: vi.fn(),
}));
vi.mock("@clerk/nextjs/server", () => ({ auth: authMock }));
vi.mock("./db", () => ({ getInitiative: getInitiativeMock }));

import { guardUser, guardInitiative } from "./guard";

beforeEach(() => {
  authMock.mockReset();
  getInitiativeMock.mockReset();
});

describe("guardUser", () => {
  it("rejects an unauthenticated request with 401", async () => {
    authMock.mockResolvedValue({ userId: null });
    const g = await guardUser();
    expect(g.ok).toBe(false);
    if (!g.ok) expect(g.response.status).toBe(401);
  });

  it("passes a signed-in user through", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });
    const g = await guardUser();
    expect(g.ok).toBe(true);
    if (g.ok) expect(g.userId).toBe("user_123");
  });
});

describe("guardInitiative", () => {
  it("rejects an unauthenticated request with 401", async () => {
    authMock.mockResolvedValue({ userId: null });
    const g = await guardInitiative("i1");
    expect(g.ok).toBe(false);
    if (!g.ok) expect(g.response.status).toBe(401);
  });

  it("returns 404 when the user does not own the initiative", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });
    getInitiativeMock.mockResolvedValue(null);
    const g = await guardInitiative("someone-elses-id");
    expect(g.ok).toBe(false);
    if (!g.ok) expect(g.response.status).toBe(404);
  });

  it("passes through when the user owns the initiative", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });
    getInitiativeMock.mockResolvedValue({ id: "i1", ownerUserId: "user_123" });
    const g = await guardInitiative("i1");
    expect(g.ok).toBe(true);
    if (g.ok) expect(g.initiative.id).toBe("i1");
  });
});
