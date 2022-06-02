import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD9e5HkCujSQCYFZ8s9JCzgw5uCSfFzW6o",
  authDomain: "message-ccea8.firebaseapp.com",
  projectId: "message-ccea8",
  storageBucket: "message-ccea8.appspot.com",
  messagingSenderId: "813634721303",
  appId: "1:813634721303:web:9d6cbc132c47a55bd82e52",
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
