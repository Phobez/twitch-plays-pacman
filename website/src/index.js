import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, get, child } from "firebase/database";

function setUpFirebaseConnection() {
    const firebaseConfig = {
        apiKey: "AIzaSyBYzb_qIiCviE0Ftf9tQbC85jgEk5no0VM",
        authDomain: "cig-group-one.firebaseapp.com",
        databaseURL: "https://cig-group-one-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "cig-group-one",
        storageBucket: "cig-group-one.appspot.com",
        messagingSenderId: "615504754008",
        appId: "1:615504754008:web:dcfad2aa7428505300612d",
        databaseURL: "https://cig-group-one-default-rtdb.asia-southeast1.firebasedatabase.app",
    };
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);

    return {
        app: app,
        database: database
    }
}

function onActionButtonClick(database, actionId) {
    console.log(actionId + " clicked!");
    const databaseRef = ref(database);

    get(child(databaseRef, 'actions/' + actionId)).then((snapshot) => {
        if (snapshot.exists()) {
            const value = snapshot.val();

            set(ref(database, 'actions/' + actionId), value + 1);
        } else {
            set(ref(database, 'actions/' + actionId), 0);
        }
    }).catch((error) => {
        console.error(error);
    });
}

function setUpButtons(database, buttons) {
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].onclick = function() {
            onActionButtonClick(database, i)
        };
    }
}

function enableAllButtons(buttons) {
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].disabled = false;
    }
}

function disableAllButtons(buttons) {
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].disabled = true;
    }
}

function listenForGame(database, buttons) {
    const gameStateRef = ref(database, 'gameState');

    onValue(gameStateRef, (snapshot) => {
        const gameState = snapshot.val();

        if (gameState === 'started') {
            enableAllButtons(buttons);
        } else if (gameState === 'unstarted') {
            disableAllButtons(buttons);
        }
    });
}

function setUp() {
    const { app, database } = setUpFirebaseConnection();
    const buttons = document.getElementsByTagName('button');

    setUpButtons(database, buttons);
    listenForGame(database, buttons);
}

setUp();
