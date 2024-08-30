import { useState, useRef, useEffect } from 'react';
import "../Styles/dashboard.css";
import { useLocation, useNavigate } from 'react-router-dom';

function DashBoard() {
    const location = useLocation();
    const { userName } = location.state || {};
    
    const [ws, setWs] = useState(null);
    const [message, setMessage] = useState('');
    const [typing, setTyping] = useState('');
    const [chat, setChat] = useState([]);
    const [users, setUsers] = useState([]);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate()
    useEffect(()=>{
        if(!userName){
            navigate('/')
        }
    })

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:3000');
        setWs(socket);

        socket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            switch (data.type) {
                case 'typing':
                    setTyping(`${data.username} is typing...`);
                    setTimeout(() => setTyping(''), 3000);
                    break;
                case 'chat': {
                    const formattedMessage = `${data.username}: ${data.message} (${new Date(data.timestamp).toLocaleTimeString()})`;
                    console.log(formattedMessage);
                    setChat(prevChat => [...prevChat, formattedMessage]);
                    break;
                }
                case 'chatHistory': {
                    const history = data.chatHistory.map(msg => 
                        `${msg.username}: ${msg.message} (${new Date(msg.timestamp).toLocaleTimeString()})`
                    );
                    setChat(history);
                    break;
                }
                case 'users':
                    setUsers(data.users);
                    break;
                 case 'notification':
                setChat(prevChat => [...prevChat, `${data.message} `]);
                    break;
                default:
                    break;
            }
        };

        
        socket.onopen = () => {
            if (userName) {
                socket.send(JSON.stringify({ type: 'username', username: userName }));
            }
        };

        return () => {
            socket.close();
        };
    }, [userName]);

    const handleSendMessage = () => {
        if (message) {
            ws.send(JSON.stringify({ type: 'chat', username: userName, message }));
            setMessage('');
            scrollToBottom();
        }
    };

    const handleTyping = () => {
        ws.send(JSON.stringify({ type: 'typing', username: userName }));
    };
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="dashboard-container">
            <div className="chat-container">
                <div className="header">
                    <h1># Chat Application</h1>
                </div>
                <div className="messages-container">
                    {chat.map((chatMessage, index) => {
                        const [messagePart, timestamp] = chatMessage.split(' (');
                        const [username, message] = messagePart.split(': ');

                        const isUserMessage = username === userName;

                        return (
                            <div 
                                key={index} 
                                className={`message ${isUserMessage ? 'user-message' : 'other-message'}`}
                            >
                                {messagePart.includes('**') ? (
                                    <div className="message-notification">{messagePart.replace('** ', '').replace(' **', '')}</div>
                                ) : (
                                    <>
                                        <div className="message-username">{username}</div>
                                        <div className="message-text">{message}</div>
                                        <div className="message-timestamp">{timestamp?.slice(0, -1)}</div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                    <div  ref={messagesEndRef} />
                </div>
               
               

                
                <div className="input-container">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        onKeyPress={handleTyping}
                    />
                    <button onClick={handleSendMessage}>Send</button>
                </div>
            </div>
            <div className="online-members">
                <h2 style={{color:'white'}}>Online Members</h2>
                <div style={{color:'white', padding:"1px"}} className="typing-indicator">{typing}</div>
                <ul>
                    {users.map((user, index) => (
                        <li  style={{color:'green'}}key={index}>{user}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default DashBoard;
