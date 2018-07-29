const puppeteer = require("puppeteer");
const sessionFactory = require("../factories/sessionFactory");
const userFactory = require("../factories/userFactory");

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    const customPage = new CustomPage(page);
    return new Proxy(customPage, {
      get: function(target, property) {
        //the order is important because there is a close function in both browser and page object
        //and we want the close method in the browser class to be prioritized over that of the page class
        return target[property] || browser[property] || page[property];
      }
    });
  }

  constructor(page) {
    this.page = page;
  }

  async login() {
    //to sign in a signed session token similar to the one created by cookie-parser will be genreated for an existing user in the database

    const user = await userFactory();
    const { session, sig } = sessionFactory(user);

    //4. set the generated session in the cookie of our chromium instance
    //cookie-parser gives session as the name of the cookie and
    //session.sig as the session signature
    await this.page.setCookie({ name: "session", value: session });
    await this.page.setCookie({ name: "session.sig", value: sig });

    //the header will get updated with the session in the chromium browser only if the page is refreshed
    await this.page.goto("http://localhost:3000/blogs");

    //pause code execution till the page has loaded and the DOM element has rendered
    await this.page.waitFor('a[href="/auth/logout"');
  }

  //wrap $eval function so that the api is friendlier
  async getContentsOf(selector) {
    return this.page.$eval(selector, el => el.innerHTML)
  }
}

module.exports = CustomPage;
