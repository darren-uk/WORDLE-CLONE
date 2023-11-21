//constant elements
const statContainer = document.getElementById("stat-container");
const statButton = document.querySelector("#stat-button");
const green = "rgb(106, 170, 100)";
const yellow = "rgb(201, 180, 88)";

// SETUP KEYBOARD
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
	//print statspanel
	statContainer.innerHTML = `
    <div class="statscreen">
        <div class="close-box" id="close-box">X</div>
        <h2>Wordle <span>Unlimited</span></h2>
        <p class="start-line">Want to try again? <button class="start-button" id="stat-start-button">Start New Game</button></p>
		<hr>
		<p>Win % = ${percentage}</p>
        <p>Games played = ${played}</p>
        <p>Games won = ${gamesWon}</P>
	    <p>Games Lost = ${gamesLost}</p>

        <p>Current streak = ${currentStreak}</p>
        <p>Max streak = ${maxStreak}</p>
		<hr>
        <p><img src="./images/triangle-exclamation-solid.svg" class="warning-icon"><button class="reset-button" id="reset-button">Reset Stats</button><img src="./images/triangle-exclamation-solid.svg" class="warning-icon"></p>
	</div>`;

	const closeBox = document.getElementById("close-box");
	closeBox.addEventListener("click", () => {
		statContainer.classList.remove("forward");
		statContainer.classList.add("back");
	});
	const statStartButton = document.getElementById("stat-start-button");
	statStartButton.addEventListener("click", () => {
		statContainer.classList.remove("forward");
		statContainer.classList.add("back");
		startGame();
	});
}
statsPanel();

function startGame() {
	fetch("words.json")
		.then((res) => res.json())
		.then((words) => {
			const NUMBER_OF_GUESSES = 6;
			let allWords = words.all; // returns array
			let commonWords = words.common; //returns array
			let guessesRemaining = NUMBER_OF_GUESSES;
			let currentGuess = [];
			let nextLetter = 0;
			// let letterPosition = 0;

			let answer = commonWords[Math.floor(Math.random() * commonWords.length)];
			console.log(answer); // show answer in console

			// Initialise Board
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
			initBoard();

			// watch user inputs
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
				let row =
					document.getElementsByClassName("letter-row")[6 - guessesRemaining];
				let box = row.children[nextLetter];
				animateCSS(box, "pulse");
				box.textContent = pressedKey;
				box.classList.add("filled-box");
				currentGuess.push(pressedKey);
				nextLetter += 1;
				// return;
			}

			function deleteLetter() {
				let row =
					document.getElementsByClassName("letter-row")[6 - guessesRemaining];
				let box = row.children[nextLetter - 1];
				box.textContent = "";
				box.classList.remove("filled-box");
				currentGuess.pop();
				nextLetter -= 1;
			}

			let coloredKeys = document.querySelectorAll(".keyboard-button");
			coloredKeys.forEach((c) => {
				c.style.backgroundColor = "var(--key-background)";
				c.classList.remove("light-text");
			});

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

			// CHECK GUSSES
			function checkGuess() {
				let row =
					document.getElementsByClassName("letter-row")[6 - guessesRemaining];
				let guessString = "";
				let rightGuess = Array.from(answer);

				for (const val of currentGuess) {
					guessString += val;
				}

				if (guessString.length != 5) {
					toastr.error("Not enough letters!");
					return;
				}

				if (!allWords.includes(guessString)) {
					toastr.error("Word not in list!");
					return;
				}

				for (let i = 0; i < 5; i++) {
					let letterColor = "";
					let box = row.children[i];
					let letter = currentGuess[i];

					let letterPosition = rightGuess.indexOf(currentGuess[i]);

					// const statStartButton = document.getElementById("stat-start-button");
					// statStartButton.addEventListener("click", () => {
					// 	i = 0;
					// 	letter = 0;
					// 	box = 0;
					// 	letterPosition = 0;
					// });

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

				if (guessString === answer) {
					toastr.success("You guessed right! Game over!");
					guessesRemaining = 0;
					winner();
					statsPanel();
					setTimeout(() => {
						statContainer.classList.remove("back");
						statContainer.classList.add("forward");
					}, "1500");
					return;
				} else {
					guessesRemaining -= 1;
					currentGuess = [];
					nextLetter = 0;

					if (guessesRemaining === 0) {
						toastr.error("You've run out of guesses! Game over!");
						toastr.info(`The right word was: "${answer}"`);
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

			// SET SCORE
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

					node.addEventListener("animationend", handleAnimationEnd, {
						once: true,
					});
				});
		})
		.catch((error) => {
			let errorBox = document.querySelector("#error-box");
			errorBox.innerText =
				"Please try again later (error connecting with our server)";
			console.log("ERROR " + error);
		});
}

// Buttons ----------------------------------------

// Start Game Buttons
function startButton() {
	let startButton = document.getElementById("start-button");
	if (startButton) {
		startButton.addEventListener("click", () => {
			statContainer.classList.remove("forward");
			statContainer.classList.add("back");
			startGame();
		});
	}
}

startButton();

//Stat screen Button
statButton.addEventListener("click", () => {
	statContainer.classList.remove("back");
	statContainer.classList.add("forward");
});
