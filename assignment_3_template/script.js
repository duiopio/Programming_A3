/*
 * Assignment 3: Functional Prototype
 * ----------------------------------
 * Programming 2022, Interaction Design Bacherlor, Malmö University
 * 
 * This assignment is written by:
 * Filippo De Togni
 * 
 * 
 * The template contains some sample code exemplifying the template code structure.
 * You should use the structure with `state`, `settings`, `setup` and `loop`. 
 * `scale` and `toAbsolute` are very helpful in data processing.
 * 
 * For instructions, see the Canvas assignment: https://mau.instructure.com/courses/11936/assignments/84965
 * You might want to look at the Assignment examples for more elaborate starting points.
 *
 */


// The state should contain all the "moving" parts of your program, values that change.
let state = Object.freeze({
    keys: [],
    lastPressed: 0,
    annoying: false,
    randomIndex: 0,
});


// The settings object contains all of the "fixed" parts of your sketch, 
// like static HTMLElements, paramaters or thresholds.
const settings = Object.freeze({
    textElement: document.querySelector("#text"),
    instructionsElement: document.querySelector("#instructions"),
    ignoredKeys: [
        "MetaLeft",
        "MetaRight",
        "AltLeft",
        "AltRight",
        "ShiftLeft",
        "ShiftRight",
        "Tab",
        "ControlLeft",
        "ControlRight",
        "CapsLock",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown"
    ],
    threshold: 350,
    strings: [
        "😇 I hope you're not in a rush to write something 😇",
        "I told you, didn't I?",
        "Might be going a bit too fast",
        "You can relax a bit, you know?",
        "Why are you in such a hurry? 😊",
        "There's plenty of time in life. Don't rush."
    ],
});


/**
 * Update the state object with the properties included in `newState`.
 * @param {Object} newState An object with the properties to update in the state object.
 */
function updateState(newState) {
    state = Object.freeze({ ...state, ...newState });
}

/** Delete the last character in the string that is passed into the function and returns it once it's been modified.
 * Solution by Jon Erickson here: https://stackoverflow.com/questions/952924/how-do-i-chop-slice-trim-off-last-character-in-string-using-javascript
 * @param {string} text
 * @returns {number}
 */
function deleteLastCharacter(text) {
    return text.substring(0, text.length - 1);
}


/** Returns a random whole number from 1 up to the lenght of the strings array
 * @returns {number}
 */
function getRandomIndex() {
    const { strings } = settings;
    const lastIndex = strings.length;
    const randomNumber = Math.round(Math.random() * lastIndex);

    // Never return zero (the default string)
    if (randomNumber === 0) { return 1 };
    return randomNumber;
}


/** Wiggle the text and make the background red.
 */
function annoy() {
    const { textElement, instructionsElement, strings } = settings;
    const { randomIndex } = state;

    // Handle color
    document.body.style.backgroundColor = "red";
    instructionsElement.style.color = "white";

    // Change string
    instructionsElement.innerHTML = strings[randomIndex];

    // Animate big text
    textElement.classList.add("wiggle");
}


/**
 *  Reset the text position and animation and make the background gray.
 */
function unAnnoy() {
    const { textElement, instructionsElement, strings } = settings;

    // Handle color
    document.body.style.backgroundColor = "gainsboro";
    instructionsElement.style.color = "gray";

    // Change string
    instructionsElement.innerHTML = strings[0];

    // Remove animation for the big text
    textElement.classList.remove("wiggle");
}


/** Check if a certain amount of time has passed between now and the last time a key was pressed
 * @return {Boolean}
 */
function shouldHandleEvent() {
    const now = performance.now();
    const { lastPressed } = state;
    const { threshold } = settings;

    const difference = now - lastPressed;
    if (difference < threshold) {
        return false;
    } else {
        return true;
    }
}


/**
 * 
 * @param {KeyboardEvent} event 
 * @param {String} text
 */
function handleCharacter(event, text) {
    const { textElement } = settings;
    const { keys } = state;

    // Handle deletion, new line and new characters
    if (event.code === "Backspace") {
        // Remove last key from the array
        keys.pop();

        // Update the text by removing the last character
        text = deleteLastCharacter(text);
        textElement.innerHTML = text;

    } else if (event.code === "Enter") {
        // Add a new line to the text
        textElement.innerHTML = text + `<br>`;

    } else {
        // Add the key to the array
        keys.push({
            key: event.key
        });

        // Render the string based on the array
        for (const key of keys) {
            textElement.innerHTML = text + key.key;
        }
    }
}


/**
 * Return `num` normalized to 0..1 in range min..max.
 * @param {number} num
 * @param {number} min 
 * @param {number} max 
 * @returns number
 */
function scale(num, min, max) {
    if (num < min) return 0;
    if (num > max) return 1;
    return (num - min) / (max - min);
}


/**
 * Return `num` transformed from the normalised 0..1 form back to the min..max form.
 * @param {number} num
 * @param {number} min 
 * @param {number} max 
 * @returns number
 */
function toAbsolute(num, min, max) {
    if (num < 0) return min;
    if (num > 1) return max;
    return (num * (max - min)) + min;
}


/**
 * This is where we put the code that transforms and outputs our data.
 * loop() is run every frame, assuming that we keep calling it with `window.requestAnimationFrame`.
 */
function loop() {
    const { textElement } = settings;
    const { annoying } = state;

    if (annoying) {
        annoy();
        textElement.style.fontWeight = `1000`;
        textElement.style.fontSize = "40px";

    } else {
        unAnnoy();
        textElement.style.fontWeight = `300`;
        textElement.style.fontSize = "24px";
    }

    window.requestAnimationFrame(loop);
}


/**
 * Setup is run once, at the start of the program. It sets everything up for us!
 */
function setup() {
    const { keys } = state;
    const { ignoredKeys, textElement, threshold } = settings;
    const spanEl = document.createElement("span");
    spanEl.id = "cursor";
    spanEl.innerHTML = "|";

    document.addEventListener("keydown", function (event) {
        // Stop event from running if the annoyance is already running.
        const { annoying } = state;
        if (annoying) return;

        // Check if enough time has passed since the last key was pressed.
        if (!shouldHandleEvent()) {
            // Remove the cursors in case it's already there and add it back.
            removeCursor(textElement, spanEl);


            // Update the state to trigger the animation and show a random string on the bottom of the screen.
            updateState({ annoying: true, randomIndex: getRandomIndex() });

            // Wait before returning to normal state
            setTimeout(() => {
                updateState({ annoying: false });
                addCursor(textElement, spanEl);
            }, threshold * 4);
            return;

        } else {
            // Remov the annoyance
            updateState({ annoying: false });
        }

        // Check if the key is one that should be rendered.
        if (ignoredKeys.includes(event.code)) return;

        // Remove the cursor before caputring the text
        removeCursor(textElement, spanEl);

        // Capture the current content of the textElement
        let text = textElement.innerHTML;

        // Handle the characters, deletion or "Enter" and then add the cursor at the end
        handleCharacter(event, text);
        addCursor(textElement, spanEl);

        // Record the time in the state (this is needed to manage the annoyance-triggering)
        updateState({ lastPressed: performance.now() });
    });



    loop();
}

setup(); // Always remember to call setup()!

/** Removes the cursor form the textElement
 * @param {Element} textElement 
 * @param {Element} spanEl 
 */
function removeCursor(textElement, spanEl) {
    if (textElement.lastElementChild == spanEl) {
        spanEl.remove();
    }
}

function addCursor(textElement, spanEl) {
    textElement.insertAdjacentElement("beforeend", spanEl);
}