
const firebase = require("firebase/app");

firebase.initializeApp({
    apiKey: "AIzaSyAce1xe6EfJvckRGTMPBA-IDZ_TKUDrCuA",
    authDomain: "iknelia-3cd8e.firebaseapp.com",
    projectId: "iknelia-3cd8e",
    storageBucket: "iknelia-3cd8e.appspot.com",
    messagingSenderId: "989607099791",
    appId: "1:989607099791:web:8bd67fa1ad6a0264495ffa"
  });
const storage = firebase.storage();

module.exports = { firebase , storage };