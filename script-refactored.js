// Constants
const NUMBER_OF_GUESSES = 6;
const green = "rgb(138, 188, 177)";
const yellow = "rgb(241, 179, 96)";

// Variables
let gameActive = false;
let allWords, commonWords, answer;
let guessesRemaining = NUMBER_OF_GUESSES;
let nextLetter = 0;
let currentGuess = [];
let statContainer = document.getElementById("stat-container");
let coloredKeys = document.querySelectorAll(".keyboard-button");
let notificationBox = document.getElementById("notification-container");

// Functions
function startGame() {
	guessesRemaining = NUMBER_OF_GUESSES;
	currentGuess = [];
	nextLetter = 0;
	answer = commonWords[Math.floor(Math.random() * commonWords.length)];
	console.log(answer); // show answer in console;
	initBoard();
	gameActive = true;
}

function initBoard() {
	let board = document.getElementById("game-board");
	board.innerHTML = "";
	for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
		let row = document.createElement("div");
		row.className = "letter-row";
		for (let j = 0; j < 5; j++) {
			let box = document.createElement("div");
			box.className = "letter-box";
			row.appendChild(box);
		}
		board.appendChild(row);
	}
}

function endGame() {
	gameActive = false;
	coloredKeys.forEach((c) => {
		if (
			c.classList.contains("green-text") ||
			c.classList.contains("red-text")
		) {
		} else {
			c.style.backgroundColor = "var(--key-background)";
			c.classList.remove("light-text");
		}
	});
}

function insertNotification(e, i) {
	const animationTime = "6500";
	let nfc = document.createElement("div");
	nfc.classList.add(e);
	nfc.innerHTML = i;
	nfc.style.animationName = "show";
	nfc.style.animationDuration = animationTime + "ms";

	notificationBox.appendChild(nfc);

	setTimeout(() => {
		notificationBox.removeChild(nfc);
	}, animationTime);
}

function checkGuess() {
	let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
	let guessString = "";
	let rightGuess = Array.from(answer);

	for (const val of currentGuess) {
		guessString += val;
	}

	if (guessString.length != 5) {
		insertNotification("red-alert", "Not enough letters!");
		// red
		return;
	}

	if (!allWords.includes(guessString)) {
		insertNotification("red-alert", "word not in list!");
		// red
		return;
	}

	for (let i = 0; i < 5; i++) {
		let letterColor = "";
		let box = row.children[i];
		let letter = currentGuess[i];

		let letterPosition = rightGuess.indexOf(currentGuess[i]);

		// is letter in the correct guess
		if (letterPosition === -1) {
			letterColor = "var(--letter-box-filled)";
		} else {
			// now, letter is definitely in word
			// if letter index and right guess index are the same
			// letter is in the right position
			if (currentGuess[i] === rightGuess[i]) {
				// shade green
				letterColor = green;
			} else {
				// shade box yellow
				letterColor = yellow;
			}
			rightGuess[letterPosition] = "#";
		}

		let delay = 250 * i;
		setTimeout(() => {
			//flip box
			applyAnimation(box, "flipInX");
			//shade box
			box.style.backgroundColor = letterColor;
			shadeKeyBoard(letter, letterColor);
			box.classList.add("light-text");
		}, delay);
	}

	if (guessString === answer) {
		insertNotification("green-alert", "You guessed right! Game over!");

		guessesRemaining = 0;
		winner();
		statsPanel();
		setTimeout(() => {
			statContainer.classList.remove("back");
			statContainer.classList.add("forward");
		}, "3000");
		return;
	} else {
		guessesRemaining -= 1;
		currentGuess = [];
		nextLetter = 0;

		if (guessesRemaining === 0) {
			insertNotification(
				"red-alert",
				`You've run out of guesses ! <br><br>Game Over ! <br><br>The right word was: ${answer}`
			);

			loser();
			statsPanel();
			setTimeout(() => {
				statContainer.classList.remove("back");
				statContainer.classList.add("forward");
			}, "1500");
			return;
		}
	}
}

function statsPanel() {
	//check local storage
	let gamesWon = localStorage.getItem("wins");
	let gamesLost = localStorage.getItem("loses");
	let maxStreak = localStorage.getItem("max-streak");
	let currentStreak = localStorage.getItem("current-streak");
	let played = Number(gamesWon) + Number(gamesLost);

	if (gamesWon == null) {
		gamesWon = 0;
	}
	if (gamesLost == null) {
		gamesLost = 0;
	}
	if (maxStreak == null) {
		maxStreak = 0;
	}
	if (currentStreak == null) {
		currentStreak = 0;
	}

	let percentage = Math.round((Number(gamesWon) / played) * 100);
	if (isNaN(percentage)) {
		percentage = 0;
	}
	//layouts

	const statLayout = `
		<div class="statscreen">
		<div class="close-box" id="close-box">X</div>
		<h2>Wordle<span>pop</span></h2>
		<p class="settings-line"><img src="./images/gear-solid.svg" class="settings-icon"><button class="settings-button" id="settings-button">Settings</button></p>
		<hr>
		<p>Win % = ${percentage}</p>
		<p><span style="color:var(--yellow);">Current streak = ${currentStreak}</span></p>
		<p>Games played = ${played}</p>
		<p><span style="color:var(--green);">Games won = ${gamesWon}</span></P>
		<p><span style="color:var(--red);">Games Lost = ${gamesLost}</span></p>
		<p>Max streak = ${maxStreak}</p>

		<hr>
		<p class="start-line">Want to try again? <button class="start-button" id="stat-start-button">Start New Game</button></p>
		</div>
		`;

	const settingsLayout = `
		<div class="statscreen">
		<div class="back-box" id="back-box">Back</div>
		<div class="close-box" id="close-box">X</div>
		<h2>Wordle<span>pop</span></h2>
		<hr>
		<button>Clear stats (excluding streak)</button>
		<button>Clear streak</button>
		<hr>
		<button>select pop theme</button>
		<button>select classic theme</button>
		<hr>
		<p> contact me via Twitter</p>
		<a href="./info.html">Readme details</a>
		<hr>
		<p class="start-line">Want to try again? <button class="start-button" id="stat-start-button">Start New Game</button></p>
		</div>
		`;

	//print statspanel
	statContainer.innerHTML = statLayout;

	//close button - stat screen
	const closeBox = document.getElementById("close-box");
	closeBox.addEventListener("click", () => {
		statContainer.classList.remove("forward");
		statContainer.classList.add("back");
	});

	//start button - stat screen
	const statStartButton = document.getElementById("stat-start-button");
	statStartButton.addEventListener("click", () => {
		statContainer.classList.remove("forward");
		statContainer.classList.add("back");
		endGame();
		startGame();
	});

	// settings button
	const settingsButton = document.querySelector("#settings-button");
	settingsButton.addEventListener("click", () => {
		statContainer.innerHTML = settingsLayout;
		// close button - settings screen
		const closeBox = document.getElementById("close-box");
		closeBox.addEventListener("click", () => {
			statContainer.classList.remove("forward");
			statContainer.classList.add("back");
			statsPanel();
		});
		//start button - settings screen
		const statStartButton = document.getElementById("stat-start-button");
		statStartButton.addEventListener("click", () => {
			statContainer.classList.remove("forward");
			statContainer.classList.add("back");
			endGame();
			startGame();
		});
	});

	//reset button

	// const resetButton = document.querySelector("#reset-button");
	// resetButton.addEventListener("click", () => {
	// 	localStorage.removeItem("wins");
	// 	localStorage.removeItem("loses");
	// 	localStorage.setItem("current-streak", 0);
	// 	// localStorage.setItem("max-streak", 0);
	// 	statsPanel();
	// });
}
statsPanel();

function winner() {
	let wins = localStorage.getItem("wins");
	if (!wins) {
		wins = 0;
	}
	wins = +wins + 1;
	localStorage.setItem("wins", wins);
	setCurrentStreak();
}

function loser() {
	let loses = localStorage.getItem("loses");
	if (!loses) {
		loses = 0;
	}
	loses = +loses + 1;
	localStorage.setItem("loses", loses);
	localStorage.setItem("current-streak", 0); //reset current streak
}

function setCurrentStreak() {
	let currentStreak = localStorage.getItem("current-streak");
	if (!currentStreak) {
		currentStreak = 0;
	}
	currentStreak = +currentStreak + 1;
	localStorage.setItem("current-streak", currentStreak);
	let maxStreak = localStorage.getItem("max-streak");
	if (!maxStreak || maxStreak < currentStreak) {
		localStorage.setItem("max-streak", currentStreak);
	}
}

function insertLetter(pressedKey) {
	if (!gameActive || nextLetter === 5) {
		return;
	}
	let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
	let box = row.children[nextLetter];
	applyAnimation(box, "pulse");
	box.textContent = pressedKey;
	box.classList.add("filled-box");
	currentGuess.push(pressedKey);
	nextLetter += 1;
}

function deleteLetter() {
	let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
	let box = row.children[nextLetter - 1];
	box.textContent = "";
	box.classList.remove("filled-box");
	currentGuess.pop();
	nextLetter -= 1;
}

function shadeKeyBoard(letter, color) {
	for (const elem of document.getElementsByClassName("keyboard-button")) {
		if (elem.textContent === letter) {
			let oldColor = elem.style.backgroundColor;
			if (oldColor === green || (oldColor === yellow && color !== green)) {
				return;
			}
			elem.style.backgroundColor = color;
			elem.classList.add("light-text");
			break;
		}
	}
}

function applyAnimation(element, animation, duration = "0.3s") {
	element.style.animation = `${animation} ${duration}`;
	element.addEventListener("animationend", () => {
		element.style.animation = "";
	});
}

// Event Handlers
function handleKeyboardClick(e) {
	const target = e.target;
	if (!target.classList.contains("keyboard-button")) {
		return;
	}
	let key = target.textContent;
	if (key === "Del") {
		key = "Backspace";
	}
	document.dispatchEvent(new KeyboardEvent("keyup", { key: key }));
}

function handleKeyUp(e) {
	if (guessesRemaining === 0) {
		return;
	}
	let pressedKey = String(e.key);
	if (pressedKey === "Backspace" && nextLetter !== 0) {
		deleteLetter();
		return;
	}
	if (pressedKey === "Enter") {
		checkGuess();
		return;
	}
	let found = pressedKey.match(/[a-z]/gi);
	if (found && found.length === 1) {
		insertLetter(pressedKey);
	}
}

function handleStatButtonClick() {
	statContainer.classList.remove("back");
	statContainer.classList.add("forward");
}

function handleStartButtonClick() {
	statContainer.classList.remove("forward");
	statContainer.classList.add("back");
	endGame();
	startGame();
}

// Event Listeners
document
	.getElementById("keyboard-cont")
	.addEventListener("click", handleKeyboardClick);
document.addEventListener("keyup", handleKeyUp);
const statButton = document.querySelector("#stat-button");
statButton.addEventListener("click", handleStatButtonClick);
let startButton = document.getElementById("start-button");
if (startButton) {
	startButton.addEventListener("click", handleStartButtonClick);
}

//DARK THEME SWITCH

const toggleSwitch = document.querySelector(
	'.theme-switch input[type="checkbox"]'
);

toggleSwitch.addEventListener("change", switchTheme, false);

function switchTheme(e) {
	if (e.target.checked) {
		document.documentElement.setAttribute("data-theme", "dark");
		localStorage.setItem("theme", "dark");
	} else {
		document.documentElement.setAttribute("data-theme", "light");
		localStorage.setItem("theme", "light");
	}
}

const currentTheme = localStorage.getItem("theme")
	? localStorage.getItem("theme")
	: null;

if (currentTheme) {
	document.documentElement.setAttribute("data-theme", currentTheme);

	if (currentTheme === "dark") {
		toggleSwitch.checked = true;
	}
}

// Fetch data
fetch("words.json")
	.then((res) => res.json())
	.then((words) => {
		allWords = words.all; // returns array
		commonWords = words.common; //returns array
	})
	.catch((error) => {
		let errorBox = document.querySelector("#error-box");
		errorBox.innerText =
			"Please try again later (error connecting with our server)";
		console.log("ERROR " + error);
	});
