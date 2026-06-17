import type { GithubUser } from "./GithubUser"

describe("GithubUser", () => {
  const mockUser: GithubUser = {
    login: "octocat",
    avatar_url: "https://avatars.githubusercontent.com/u/583231",
    public_repos: 8,
    bio: "Developer at GitHub"
  }

  it("should have a login as string", () => {
    expect(typeof mockUser.login).toBe("string")
  })

  it("should have a valid avatar_url", () => {
    expect(mockUser.avatar_url).toMatch(/^https:\/\//)
  })

  it("should have public_repos as number", () => {
    expect(typeof mockUser.public_repos).toBe("number")
  })

  it("should have public_repos >= 0", () => {
    expect(mockUser.public_repos).toBeGreaterThanOrEqual(0)
  })

  it("should have a bio as string", () => {
    expect(typeof mockUser.bio).toBe("string")
  })
})
