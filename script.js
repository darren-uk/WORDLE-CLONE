import { WORDS } from "./words.js";
import { commonEnglishWords } from "./common-english-words.js";

const green = "rgb(106, 170, 100)";
const yellow = "rgb(201, 180, 88)";

const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
// let rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)];
let rightGuessString =
	commonEnglishWords[Math.floor(Math.random() * commonEnglishWords.length)];
// rightGuessString = "ruins";
console.log(rightGuessString);
function initBoard() {
	let board = document.getElementById("game-board");

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

initBoard();

document.addEventListener("keyup", (e) => {
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
	if (!found || found.length > 1) {
		return;
	} else {
		insertLetter(pressedKey);
	}
});

function insertLetter(pressedKey) {
	if (nextLetter === 5) {
		return;
	}
	pressedKey = pressedKey.toLowerCase();

	let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
	let box = row.children[nextLetter];
	animateCSS(box, "pulse");
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
			if (oldColor === green) {
				return;
			}

			if (oldColor === yellow && color !== green) {
				return;
			}

			elem.style.backgroundColor = color;
			elem.classList.add("light-text");
			break;
		}
	}
}

function checkGuess() {
	let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
	let guessString = "";
	let rightGuess = Array.from(rightGuessString);

	for (const val of currentGuess) {
		guessString += val;
	}

	if (guessString.length != 5) {
		toastr.error("Not enough letters!");
		return;
	}

	if (!WORDS.includes(guessString)) {
		toastr.error("Word not in list!");
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
			animateCSS(box, "flipInX");
			//shade box
			box.style.backgroundColor = letterColor;
			shadeKeyBoard(letter, letterColor);
			box.classList.add("light-text");
		}, delay);
	}

	if (guessString === rightGuessString) {
		toastr.success("You guessed right! Game over!");
		guessesRemaining = 0;
		winner();

		setTimeout(() => {
			statsPanel();
		}, "1500");

		return;
	} else {
		guessesRemaining -= 1;
		currentGuess = [];
		nextLetter = 0;

		if (guessesRemaining === 0) {
			toastr.error("You've run out of guesses! Game over!");
			toastr.info(`The right word was: "${rightGuessString}"`);
			loser();
			setTimeout(() => {
				statsPanel();
			}, "1500");
		}
	}
}

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
	const target = e.target;

	if (!target.classList.contains("keyboard-button")) {
		return;
	}
	let key = target.textContent;

	if (key === "Del") {
		key = "Backspace";
	}

	document.dispatchEvent(new KeyboardEvent("keyup", { key: key }));
});

const animateCSS = (element, animation, prefix = "animate__") =>
	// We create a Promise and return it
	new Promise((resolve, reject) => {
		const animationName = `${prefix}${animation}`;
		// const node = document.querySelector(element);
		const node = element;
		node.style.setProperty("--animate-duration", "0.3s");

		node.classList.add(`${prefix}animated`, animationName);

		// When the animation ends, we clean the classes and resolve the Promise
		function handleAnimationEnd(event) {
			event.stopPropagation();
			node.classList.remove(`${prefix}animated`, animationName);
			resolve("Animation ended");
		}

		node.addEventListener("animationend", handleAnimationEnd, { once: true });
	});

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

	//reset current streak
	localStorage.setItem("current-streak", 0);
}

function setCurrentStreak() {
	let currentStreak = localStorage.getItem("current-streak");
	if (!currentStreak) {
		currentStreak = 0;
	}
	currentStreak = +currentStreak + 1;
	localStorage.setItem("current-streak", currentStreak);

	let maxStreak = localStorage.getItem("max-streak");

	if (!maxStreak) {
		localStorage.setItem("max-streak", currentStreak);
	}

	if (maxStreak >= currentStreak) {
		console.log("max is more or equal to running total");
	} else {
		maxStreak = +maxStreak + 1;
		localStorage.setItem("max-streak", maxStreak);
	}
}

function cleanStorage() {
	localStorage.removeItem("wins");
	localStorage.removeItem("loses");
	localStorage.removeItem("current-streak");
	localStorage.removeItem("max-streak");
}

function statsPanel(e) {
	let checkPanel = document.querySelector("#statscreen");
	let statContainer = document.getElementById("stat-container");

	// Grab statistics from local storage
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

	// check if stats panel already exists
	if (checkPanel) {
		let statScreen = document.querySelector("#statscreen");
		statScreen.innerHTML = `<div><h2>Statistics</h2><p>Games played = ${played}<p>Games won = ${gamesWon}</P>
	<p>Games Lost = ${gamesLost}</p><p>Current streak = ${currentStreak}</p><hr><p>Win % = ${percentage}</p><p>Max streak = ${maxStreak}</p>

	<img src="./images/triangle-exclamation-solid.svg" class="warning-icon" alt=""><button class="reset-button" id="reset-button">Reset Stats</button><img src="./images/triangle-exclamation-solid.svg" class="warning-icon" alt="">
	</div>`;
	} else {
		//create stat screen
		let statScreen = document.createElement("div");
		statScreen.classList.add("statscreen");
		statScreen.setAttribute("id", "statscreen");
		statScreen.innerHTML = `<div><h2>Statistics <img src="./images/ranking-star-solid.svg" class="top-icon"></h2><p>Games played = ${played}<p>Games won = ${gamesWon}</P>
	<p>Games Lost = ${gamesLost}</p><p>Current streak = ${currentStreak}</p><hr><p>Win % = ${percentage}</p><p>Max streak = ${maxStreak}</p>

	<img src="./images/triangle-exclamation-solid.svg" class="warning-icon" alt=""><button class="reset-button" id="reset-button">Reset Stats</button><img src="./images/triangle-exclamation-solid.svg" class="warning-icon" alt="">
	</div>`;

		// Add stat screen to DOM
		statContainer.appendChild(statScreen);
	}

	//Animate fade in
	statContainer.classList.remove("back");
	statContainer.classList.add("forward");
	animateCSS(statContainer, "fadeInDown");
	statContainer.style.setProperty("--animate-duration", "1.5s");

	//listen for click to close stat panel
	statContainer.addEventListener(
		"click",
		function () {
			statContainer.classList.remove("forward");
			statContainer.classList.add("back");
			if (e == "closeonly") {
			} else {
				document.location.reload(false);
			}
		},
		true
	);

	//listen for press Enter button to close stat panel
	document.addEventListener("keyup", function (k) {
		if (k.key === "Enter") {
			statContainer.classList.remove("forward");
			statContainer.classList.add("back");
			if (e == "closeonly") {
			} else {
				document.location.reload(false);
			}
		}
	});
	//reset button
	let resetButton = document.querySelector("#reset-button");
	resetButton.addEventListener("click", cleanStorage);
}

const showStatsButton = document.querySelector("#show-stats");
showStatsButton.addEventListener("click", function () {
	statsPanel("closeonly");
});

//DARK THEME SWITCH

const toggleSwitch = document.querySelector(
	'.theme-switch input[type="checkbox"]'
);

toggleSwitch.addEventListener("change", switchTheme, false);

function switchTheme(e) {
	if (e.target.checked) {
		document.documentElement.setAttribute("data-theme", "dark");
		localStorage.setItem("theme", "dark"); //add this
	} else {
		document.documentElement.setAttribute("data-theme", "light");
		localStorage.setItem("theme", "light"); //add this
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
