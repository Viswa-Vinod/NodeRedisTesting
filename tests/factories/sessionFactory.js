const Keygrip = require("keygrip");
//the app's secret key is in the config/keys file in the cookieKey variable
const keys = require("../../config/keys");
//3. sign the session string with the app's secret key using keygrip

const keygrip = new Keygrip([keys.cookieKey]);

module.exports = user => {//user is an instance of the user mongoose class
  const Buffer = require("safe-buffer").Buffer;

  //2. create a session Object similar to what cookie-parser creates with the user from mongodb
  const sessionObject = {
    passport: {
      user: user._id.toString() //user._id is an object. So you have to get a string out of it
    }
  };

  const session = Buffer.from(JSON.stringify(sessionObject)).toString("base64");

  //session= neds to be prefixed because that is what cookie parser does
  const sig = keygrip.sign("session=" + session);

  return { session, sig };
};
