//login.jsx
import { useState,} from "react"; //useRef,useEffect
import '../Styles/login.css'
import { useNavigate } from "react-router-dom";

function Login() {
    const [userName, setUsername] = useState('');
    // const ws = useRef(null)
    const navigate = useNavigate()
    //  useEffect(()=>{
    //  ws.current = new WebSocket('ws://localhost:3000');
    //  ws.current.onopen=()=>{
    //     console.log("websocket connection estalished");
        
    //  }
    //  })
    const handleUserName = (e) => {
        const value = e.target.value;
        setUsername(value);
    };
    const handleLogin =()=>{
         console.log(userName,"api call");
         navigate(`/dashboard`,{state:{userName}});
}

  
    

    return (
        <div className="main-container">
            <div className="container">
                <input 
                    type="text" 
                    placeholder="Enter Username" 
                    value={userName} 
                    onChange={handleUserName}
                />
                <button disabled={userName.length === 0} onClick={handleLogin} >Enter Chat</button> 
            </div>
        </div>
    );
}

export default Login;
