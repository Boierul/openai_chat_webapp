import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

/* Load the messages */
let loadInterval = null;

/* Will show 3 dynamic dots as an indication for fetching info
   from OpenAI API's */
function loader(element) {
    element.textContent = ''

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += '.';

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

/* Will animate typing text */
function typeText(element, text) {
    let index = 0

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
        } else {
            clearInterval(interval)
        }
    }, 20)
}

/* Generate unique IDs for each message div */
function generateUniqueId() {
    // Used to generate unique IDs
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

/* Generates the message log and displays it to the user */
function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}

/*  */
const handleSubmit = async (e) => {
    // Will prevent reloading of the browser
    e.preventDefault()

    // Data from the form
    const data = new FormData(form)

    // User's message chatStripe()
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

    // Will clear the textarea input
    form.reset()

    // Bot's message chatStripe()
    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

    // Will focus scroll to the bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Specific message div
    const messageDiv = document.getElementById(uniqueId)

    // messageDiv.innerHTML = "..."
    loader(messageDiv)

    const response = await fetch('https://chatgpt-codex-backend.onrender.com/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })

    clearInterval(loadInterval)
    messageDiv.innerHTML = " "

    if (response.ok) {
        const data = await response.json()
        // Trims any trailing spaces/'\n'
        const parsedData = data.bot.trim()

        typeText(messageDiv, parsedData)
    } else {
        const error = await response.text()

        messageDiv.innerHTML = error.toString()
        // alert(error)
    }
}

form.addEventListener('submit', handleSubmit)
// Will send the input if "Enter" is pressed
form.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        handleSubmit(e)
    }
})

// Make the textarea focused on each page reload
window.onload = function () {
    const text = document.getElementById('textarea-id');
    text.focus()

    window.onhashchange = function () {
        text.focus()
    }
}

