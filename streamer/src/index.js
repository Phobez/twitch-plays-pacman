const serviceAccount = require("./serviceAccountKey.json");
const firebase = require('firebase-admin');
const robot = require("robotjs");
const http = require('http');

const actionIds = {
    '0': 'k',
    '1': 'm',
    '2': 'n',
    '3': 'p',
    '4': '1',
    '5': 'u',
    '6': 'a',
    '7': 'q',
    '8': 'r',
    '9': '3',
    '10': 'o',
    '11': 'd',
    '12': 'e',
    '13': 'y',
    '14': '6',
    '15': '7',
    '16': '4',
    '17': '5'
};

function setUpFirebaseConnection() {
    const firebaseConfig = {
        credential: firebase.credential.cert(serviceAccount),
        databaseURL: "https://cig-group-one-default-rtdb.asia-southeast1.firebasedatabase.app",
    };

    firebase.initializeApp(firebaseConfig);
}

function setUpServer() {
    const hostname = '127.0.0.1';
    const port = 51133;

    return {
        server: http.createServer((req, res) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Hello World');
        }),
        port: port,
        hostname: hostname
    }
}

function clearActionCounts(database) {
    for (let i = 0; i < 18; i++) {
        const ref = database.ref('actions/' + i);

        ref.set(0);
    }
}

function listenToActions(database, actions) {
    const ref = database.ref('actions');

    ref.on('value', (snapshot) => {
        actions.value = snapshot.val();
    }, (errorObject) => {
        console.log('The read failed: ' + errorObject.name);
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

function executeAction(actions, database) {
    const indices = indicesOfMax(actions.value);
    let actionIndex = -1;

    if (indices.length === 0) {
        console.log("No action.");
        return;
    } else if (indices.length > 1) {
        actionIndex = indices[Math.floor(Math.random() * indicesOfMax.length)];
    } else {
        actionIndex = indices[0];
    }

    console.log(`Clicking ${actionIds[actionIndex]}.`);
    robot.keyTap(actionIds[actionIndex]);
    clearActionCounts(database);
}

function startGame(database) {
    const gameStateRef = database.ref('gameState');
    let actions = {
        value: []
    };

    clearActionCounts(database);
    gameStateRef.set('started');
    robot.keyTap('l');
    listenToActions(database, actions);
    setInterval(executeAction, 10000, actions, database);
}

function setUp() {
    setUpFirebaseConnection();

    const database = firebase.database();
    const { server, port, hostname } = setUpServer();

    console.log("Loading...");

    setTimeout(function() {
        startGame(database);

        server.listen(port, hostname, () => {
            console.log(`Server running at http://${hostname}:${port}/`);
        });
    }, 5000);
}

setUp();
