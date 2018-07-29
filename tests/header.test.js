// const puppeteer = require("puppeteer");

const Page = require("./helpers/page");

let page;

beforeEach(async () => {
  //launch chromium code; but this is no longer required because it has been wrapped within Page
  // browser = await puppeteer.launch({
  //   headless: false
  // });

  //open a tab in chromium; no longer required because it has been wrapped within Page
  // page = await browser.newPage();

  page = await Page.build();
  //navigate to address localhost:3000;
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  //close chromium browser after each test; no longer required because ti has been wrapped within Page
  // await browser.close();

  await page.close();
});

test("header has the correct text", async () => {
  //get text in header element
  const text = await page.getContentsOf("a.brand-logo");
  console.log(text);
  expect(text).toEqual("Blogster");
}); //set 15s timeout for async ops

test("clicking login starts the oauth flow", async () => {
  //wait for the login button to appear before proceeding with the next step.
  await page.waitFor(".right a");
  //click on the 'Login with google' button
  await page.click(".right a");

  //get the url when 'Login with google' is clicked
  const url = page.url();

  //check that the url contains accounts.google.com
  expect(url).toMatch(/accounts\.google\.com/);
});

test("when signed in shows logout button", async () => {
  await page.login();
  const text = await page.getContentsOf('a[href="/auth/logout"');
  expect(text).toEqual("Logout");
});
