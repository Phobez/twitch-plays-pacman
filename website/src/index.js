import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, get, child } from "firebase/database";

const actionNames = {
    '0': 'Wall',
    '1': 'Door for Pac-Man',
    '2': 'Door for Ghosts',
    '3': 'Power Pellet',
    '4': 'Speed Boost Pac-Man',
    '5': 'Speed Boost Blue Ghost',
    '6': 'Speed Boost Green Ghost',
    '7': 'Speed Boost Red Ghost',
    '8': 'Speed Boost Yellow Ghost',
    '9': 'Slowify Pac-Man',
    '10': 'Slowify Blue Ghost',
    '11': 'Slowify Green Ghost',
    '12': 'Slowify Red Ghost',
    '13': 'Slowify Yellow Ghost',
    '14': 'Abacadabra Blue Ghost',
    '15': 'Abacadabra Green Ghost',
    '16': 'Abacadabra Red Ghost',
    '17': 'Abacadabra Yellow Ghost'
};

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

function indicesOfMax(array) {
    if (array.length === 0) {
        return -1;
    }

    let max = -1;
    let maxIndices = [];

    for (let i = 0; i < array.length; i++) {
        if (array[i] === 0) {
            continue;
        } else if (array[i] > max) {
            max = array[i];
            maxIndices = [i];
        } else if (array[i] === max) {
            maxIndices.push(i);
        }
    }

    return maxIndices;
}

function listenToVotes(database, topVotedDisplay) {
    const actionsRef = ref(database, 'actions');
    const prefix = "Current Top Voted: ";

    onValue(actionsRef, (snapshot) => {
        const indices = indicesOfMax(snapshot.val());

        if (indices.length === 0) {
            topVotedDisplay.innerHTML = prefix + "<br>NONE";
        } else {
            let topVotedActions = '';

            for (let i = 0; i < indices.length; i++) {
                topVotedActions += `<br>${actionNames[indices[i]]}`;
            }
            
            topVotedDisplay.innerHTML = prefix + topVotedActions;
        }

    }, (errorObject) => {
        console.log('The read failed: ' + errorObject.name);
    });
}

function setUp() {
    const { app, database } = setUpFirebaseConnection();
    const buttons = document.getElementsByTagName('button');
    const topVotedDisplay = document.getElementById('top-voted');

    setUpButtons(database, buttons);
    listenForGame(database, buttons);
    listenToVotes(database, topVotedDisplay);
}

setUp();
