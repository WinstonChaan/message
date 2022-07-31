import React, { useRef, useState } from "react";
import "./App.css";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
require("dotenv").config();

firebase.initializeApp({
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className='App bg-stone-400 h-screen pt-3'>
      <header className='flex'>
        <SignOut />{" "}
        {user ? (
          <button
            className='mr-auto ml-1 justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            onClick={undo}
          >
            Unsend
          </button>
        ) : (
          <></>
        )}
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

async function undo() {
  let dataID = [];
  await firestore
    .collection("messages")
    .get()
    .then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        if (doc.data().uid === auth.currentUser.uid) {
          dataID.push(doc.id);
        }
      });
    });
  let lastMessage = dataID[dataID.length - 1];
  return firestore.collection("messages").doc(lastMessage).delete();
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };
  return (
    <>
      <body className='bg-stone-400 h-screen'>
        <div className='flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 '>
          <div className='mt-20 max-w-md w-full space-y-8'>
            <div>
              <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
                Live React Chat
              </h2>
              <p className='mt-2 text-center text-sm text-gray-600'>
                <a href='wow' className='font-medium text-black'>
                  sign in to begin
                </a>
              </p>
            </div>
            <div>
              <button
                onClick={signInWithGoogle}
                type='submit'
                className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              >
                Sign In With Google
              </button>
            </div>
          </div>
        </div>
      </body>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button
        className='ml-auto mr-1 relative w-50 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
        onClick={() => auth.signOut()}
      >
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);
  const [messages] = useCollectionData(query, { idField: "id" });
  const [formValue, setFormValue] = useState("");
  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL, displayName } = auth.currentUser;
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
      displayName,
    });
    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <div className='chatroom mt-3 rounded-t-3xl overflow-y-auto pt-6 pb-3 pr-3 pl-3 max-w-xl bg-zinc-800 justify-center items-center m-auto'>
        <main>
          {messages &&
            messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
          <div ref={dummy}></div>
        </main>
      </div>
      <div className='bg-zinc-800 h-32 rounded-b-3xl max-w-xl m-auto'>
        <form onSubmit={sendMessage}>
          <input
            className='messagebox pl-5 mb-2 mt-5 h-10 rounded-md w-full max-w-xl'
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
            placeholder='Message'
          />
          <button
            className='sendbutton flex justify-center py-2 px-4 border border-transparent text-sm font-medium 
            rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2
            focus:ring-indigo-500 w-full'
            type='submit'
            disabled={!formValue}
          >
            Send
          </button>
        </form>
      </div>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL, displayName } = props.message;
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";
  return (
    <div className={`message ${messageClass}`}>
      <img
        alt='Profile'
        className='ml-1 float-right object-contain h-8 w-8 rounded-3xl '
        src={
          photoURL || "https://api.adorable.io/avatars/23/abott@adorable.png"
        }
      />
      <p>
        {displayName}: {text}
      </p>
    </div>
  );
}

export default App;
