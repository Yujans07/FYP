import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm your Mobile Hub assistant. How can I help you today?", isBot: true }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        // Add user message
        const userMessage = { text: inputMessage, isBot: false };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');

        // Simulate bot thinking
        setTimeout(async () => {
            let botResponse = await generateBotResponse(inputMessage);
            setMessages(prev => [...prev, { text: botResponse, isBot: true }]);
        }, 500);
    };

    const generateBotResponse = async (userInput) => {
        const input = userInput.toLowerCase();
        
        // Basic response logic
        if (input.includes('hello') || input.includes('hi')) {
            return "Hello! How can I assist you today?";
        }
        else if (input.includes('price') || input.includes('cost')) {
            return "Our mobile phones are available at various price points. You can check specific prices on the product pages. Would you like me to help you find a phone within your budget?";
        }
        else if (input.includes('delivery') || input.includes('shipping')) {
            return "We offer free delivery on orders above ₹500. Standard delivery takes 3-5 business days.";
        }
        else if (input.includes('payment') || input.includes('pay')) {
            return "We accept various payment methods including credit/debit cards, UPI, and cash on delivery.";
        }
        else if (input.includes('return') || input.includes('refund')) {
            return "We have a 7-day return policy. Products must be returned in original condition with all accessories.";
        }
        else if (input.includes('warranty')) {
            return "All our mobile phones come with standard manufacturer warranty. The warranty period varies by brand and model.";
        }
        else if (input.includes('contact') || input.includes('support')) {
            return "You can reach our customer support at support@mobilehub.com or call us at 1800-123-4567.";
        }
        else {
            return "I'm not sure about that. Would you like to speak with our customer service team? You can reach them at support@mobilehub.com";
        }
    };

    return (
        <div className="chatbot-container">
            {/* Chat Button */}
            <button 
                className={`chat-button ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? '×' : '💬'}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <h3>Mobile Hub Assistant</h3>
                    </div>
                    <div className="messages-container">
                        {messages.map((message, index) => (
                            <div 
                                key={index} 
                                className={`message ${message.isBot ? 'bot' : 'user'}`}
                            >
                                {message.text}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="input-container">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Type your message..."
                        />
                        <button type="submit">Send</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatBot; 