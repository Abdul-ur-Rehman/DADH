
// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";

// const firebaseConfig = {
//   apiKey: "AIzaSyCgnRU_MiJJMeMao5yDLFDJbREFti91oCM",
//   authDomain: "dadhproject.firebaseapp.com",
//   projectId: "dadhproject",
//   storageBucket: "dadhproject.firebasestorage.app",
//   messagingSenderId: "85254636867",
//   appId: "1:85254636867:web:623d76fa26bdab149a1bf6",
//   measurementId: "G-EZWJSCR970"
// };

// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// export { app, auth };

import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAkgQtM31CbEfSwxxt0bmm1u52JI6uT84M",
  authDomain: "dadh-62702.firebaseapp.com",
  projectId: "dadh-62702",
  storageBucket: "dadh-62702.firebasestorage.app",
  messagingSenderId: "670743666239",
  appId: "1:670743666239:web:10cac55e607c7153d5a28a",
  measurementId: "G-WWEGFH6CD2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { app, auth };