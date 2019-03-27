// Download the helper library from https://www.twilio.com/docs/node/install
// Your Account Sid and Auth Token from twilio.com/console
// DANGER! This is insecure. See http://twil.io/secure
const accountSid = 'ACa5858145fafb3decc5bc3232f6662949';
const authToken = '779c67dd1fdedcf461ce3c4414c4ac2f';
const client = require('twilio')(accountSid, authToken);

client.messages
  .create({
     body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
     from: '+12087618466',
     to: '+12087618466'
   })
  .then(message => console.log(message.sid));