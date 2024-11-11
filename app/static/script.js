document.addEventListener('DOMContentLoaded', function() {
    const chatContainer = document.getElementById('chatContainer');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const responseImage = document.getElementById('responseImage');
    let chatHistory = [];

    // Auto-resize textarea
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Handle send button click
    sendButton.addEventListener('click', sendMessage);
    
    // Handle enter key (but allow shift+enter for new lines)
    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // Add user message to chat
        addMessageToChat(message, 'user');
        chatHistory.push(message);
        
        // Clear input
        userInput.value = '';
        userInput.style.height = 'auto';
        
        // Disable input while waiting for response
        userInput.disabled = true;
        sendButton.disabled = true;

        try {
            const response = await fetch('/get_response', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    history: chatHistory
                }),
            });

            const data = await response.json();
            
            if (response.ok) {
                addMessageToChat(data.response, 'assistant');
                chatHistory.push(data.response);
                
                // Update image if provided
                if (data.image_path) {
                    responseImage.src = data.image_path;
                }
            } else {
                throw new Error(data.error || 'Failed to get response');
            }
        } catch (error) {
            addMessageToChat('Sorry, something went wrong. Please try again.', 'assistant');
            console.error('Error:', error);
        } finally {
            userInput.disabled = false;
            sendButton.disabled = false;
            userInput.focus();
        }
    }

    function addMessageToChat(content, role) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${role}-message`);
        messageDiv.textContent = content;
        
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
});