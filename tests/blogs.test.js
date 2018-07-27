const Page = require("./helpers/page");

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto("localhost:3000");
});

afterEach(async () => {
  await page.close();
});

describe("when logged in", async () => {
  beforeEach(async () => {
    await page.login();
    await page.click("a.btn-floating");
  });

  test("Can see blog create form", async () => {
    const label = await page.getContentsOf("form label");
    expect(label).toEqual("Blog Title");
  });

  describe("And using valid inputs", async () => {
    beforeEach(async () => {
      //typing into form
      await page.type(".title input", "my title");
      await page.type(".content input", "my content");
      await page.click("form button");
    });
    test("submitting takes user to review screen", async () => {
      const text = await page.getContentsOf("h5");
      expect(text).toEqual("Please confirm your entries");
    });

    test("Submitting then saving takes user to index page", async () => {
      await page.click("button.green");
      await page.waitFor(".card");
      const title = await page.getContentsOf(".card-title");
      const content = await page.getContentsOf("p");
      expect(title).toEqual("my title");
      expect(content).toEqual("my content");
    });
  });

  describe("And using invalid inputs", async () => {
    beforeEach(async () => {
      await page.click("form button");
    });
    test("form shows an error message", async () => {
      const titleErr = await page.getContentsOf(".title .red-text");
      const contentErr = await page.getContentsOf(".title .red-text");

      expect(titleErr).toEqual("You must provide a value");
      expect(contentErr).toEqual("You must provide a value");
    });
  });
});

describe("User is not logged in", async () => {
  test("user cannot create blog posts", async () => {
    const result = await page.evaluate(() => {
      return fetch("/api/blogs", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title: "My title", content: "My content" })
      }).then(res => res.json());
    });
    expect(result).toEqual({ error: "You must log in!" });
  });

  test("user cannot get blog list", async () => {
    const result = await page.evaluate(() => {
      return fetch("/api/blogs", {
        method: "GET",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        }
      }).then(res => res.json());
    });
    expect(result).toEqual({ error: "You must log in!" });
  });
});
