import type { GithubRepo } from "./GithubRepo"

describe("GithubRepo", () => {
  const mockRepo: GithubRepo = {
    name: "mi-repo",
    description: "Una descripción",
    html_url: "https://github.com/user/mi-repo",
    stargazers_count: 42
  }

  it("should have a name as string", () => {
    expect(typeof mockRepo.name).toBe("string")
  })

  it("should have a description as string", () => {
    expect(typeof mockRepo.description).toBe("string")
  })

  it("should have a valid html_url", () => {
    expect(mockRepo.html_url).toMatch(/^https:\/\/github\.com/)
  })

  it("should have stargazers_count as number", () => {
    expect(typeof mockRepo.stargazers_count).toBe("number")
  })
})
