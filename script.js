import { WORDS } from "./words.js";

let statContainer = document.getElementById("stat-container");
const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)];
// rightGuessString = "weigh";
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
			if (oldColor === "green") {
				return;
			}

			if (oldColor === "yellow" && color !== "green") {
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
			letterColor = "var(--grey)";
		} else {
			// now, letter is definitely in word
			// if letter index and right guess index are the same
			// letter is in the right position
			if (currentGuess[i] === rightGuess[i]) {
				// shade green
				letterColor = "var(--green)";
			} else {
				// shade box yellow
				letterColor = "var(--yellow)";
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
		// setTimeout(stats("rightguess"), 5000);
		setTimeout(() => {
			stats("rightguess");
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
			stats("fail");
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
}

function loser() {
	let loses = localStorage.getItem("loses");
	if (!loses) {
		loses = 0;
	}
	loses = +loses + 1;
	localStorage.setItem("loses", loses);
}

function placeStats() {
	let gamesWon = localStorage.getItem("wins");
	let gamesLost = localStorage.getItem("loses");
	if (gamesWon == null) {
		gamesWon = 0;
	}
	if (gamesLost == null) {
		gamesLost = 0;
	}
	let played = Number(gamesWon) + Number(gamesLost);
	let percentage = Math.round((Number(gamesWon) / played) * 100);
	//create elements
	let statScreen = document.createElement("div");
	statScreen.classList.add("statscreen");
	statScreen.setAttribute("id", "statscreen");
	statScreen.innerHTML = `<div><h2>Statistics</h2><p>Games played = ${played}<p>Games won = ${gamesWon}</P>
	<p>Games Lost = ${gamesLost}</p><p>Win % = ${percentage}</p><button class="reset-button" id="reset-button">Reset Stats</button></div>`;

	statContainer.appendChild(statScreen);

	//reset button
	let resetButton = document.querySelector("#reset-button");
	resetButton.addEventListener("click", cleanStorage);
}
function cleanStorage() {
	localStorage.removeItem("wins");
	localStorage.removeItem("loses");
}
placeStats();

function stats(e) {
	console.log(e);
	let statContainer = document.getElementById("stat-container");

	if (e == "closeonly") {
		statContainer.classList.remove("back");
		statContainer.classList.add("forward");
		statContainer.addEventListener(
			"click",
			function () {
				statContainer.classList.remove("forward");
				statContainer.classList.add("back");
			},
			true
		);
	} else if (e == "rightguess" || "fail") {
		let statScreen = document.querySelector("#statscreen");
		let gamesWon = localStorage.getItem("wins");
		let gamesLost = localStorage.getItem("loses");
		if (gamesWon == null) {
			gamesWon = 0;
		}
		if (gamesLost == null) {
			gamesLost = 0;
		}
		let played = Number(gamesWon) + Number(gamesLost);
		let percentage = Math.round((Number(gamesWon) / played) * 100);
		statScreen.innerHTML = `<div><h2>Statistics</h2><p>Games played = ${played}<p>Games won = ${gamesWon}</P>
	<p>Games Lost = ${gamesLost}</p><p>Win % = ${percentage}</p><button class="reset-button" id="reset-button">Reset Stats</button></div>`;
		animateCSS(statContainer, "fadeInDown");
		statContainer.classList.remove("back");
		statContainer.classList.add("forward");
		statContainer.addEventListener(
			"click",
			function () {
				document.location.reload(false);
			},
			true
		);
	} else {
		console.log("something wrong");
	}
}

const showStatsButton = document.querySelector("#show-stats");
showStatsButton.addEventListener("click", function () {
	stats("closeonly");
});
