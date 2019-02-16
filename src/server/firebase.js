const firebase = require("firebase-admin");
var serviceAccount = require("../iintw-single-firebase-adminsdk-zzrlm-3b7ecc2991.json");
const FireInstant = firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://iintw-single.firebaseio.com"
});
console.log('FIREBASE INIT');


// const FIRE = {
//     init: function() {
//         firebase.initializeApp({
//             credential: firebase.credential.cert(serviceAccount),
//             databaseURL: "https://iintw-single.firebaseio.com"
//         })
//         // .then(res => {
//         //     console.log('????????????????????????')
//         //     const db = firebase.database();
//         //     db.ref('/').once('value').then(res => console.log(res));
//         // });
        
//     },
//     DB: firebase.database(),
// }

export default FireInstant;