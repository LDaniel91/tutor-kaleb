// La URL de tu "mensajero" en Cloudflare Workers
const WORKER_URL = 'https://tutor-kaleb.luisdanielramoscorona2010.workers.dev';

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Función para mostrar un mensaje en el chat
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(sender === 'user' ? 'user-message' : 'assistant-message');
    // Convertir saltos de línea a <br> para mejor formato
    messageDiv.innerHTML = text.replace(/\n/g, '<br>');
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Función para mostrar un indicador de "cargando..."
function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading';
    loadingDiv.classList.add('message', 'assistant-message', 'loading');
    loadingDiv.textContent = 'El tutor está pensando...';
    chatBox.appendChild(loadingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function hideLoading() {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// Función para enviar la pregunta al "mensajero"
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Mostrar el mensaje del usuario
    addMessage(message, 'user');
    userInput.value = '';
    userInput.disabled = true;
    sendBtn.disabled = true;

    // Mostrar indicador de carga
    showLoading();

    try {
        // Hablar con nuestro "mensajero" (Cloudflare Worker)
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        hideLoading();

        if (data.error) {
            addMessage('❌ Hubo un error: ' + data.error, 'assistant');
        } else {
            // Mostrar la respuesta del tutor
            addMessage(data.reply, 'assistant');
        }

    } catch (error) {
        hideLoading();
        addMessage('❌ Lo siento, no pude conectar con el tutor. Inténtalo de nuevo.', 'assistant');
        console.error('Error:', error);
    } finally {
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
    }
}

// Escuchar el clic en el botón "Enviar"
sendBtn.addEventListener('click', sendMessage);

// Permitir enviar con la tecla "Enter"
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Mensaje de bienvenida
window.onload = function() {
    addMessage('👋 ¡Hola Kaleb! Soy tu tutor experto. ¿Qué asignatura o tema te gustaría trabajar hoy?', 'assistant');
};