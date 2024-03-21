import React, { useState, useEffect } from "react";
import './login.css'
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const [createroom, setcreateroom] = useState(true);
    const [username, setusername] = useState('');
    const [roomid, setroomid] = useState("");

    useEffect(() => {
        setroomid(uuidv4());
    }, [])

    function handlecreateroom() {
        setcreateroom(true)
    }
    function handlejoinroom() {
        setcreateroom(false)
    }

    function handlesubmit(event) {
        event.preventDefault();
        if (username.trim() === "") {
            if (!toast.isActive('usernameError')) {
                toast.error("Username cannot be empty!", { toastId: 'usernameError' });
            }
            return;
        }
        navigate(`/room/${roomid}`, { state: { username: username } });
    }

    return <>
        <div className="container">
            <div className="heading">
                <div className="hub">
                    <span>Code</span>
                    <span>Hub</span>
                    <div>
                        <p id="text">lets code together......</p></div>
                </div>
            </div>
            <div className="joining">

                <div className="joinbuttons">
                    <button onClick={handlecreateroom}>Create Room</button>
                    <button onClick={handlejoinroom}>Join Room</button>
                </div>

                {createroom ?
                    (<div className="userform">
                        <input type="text" id="name" name="name" placeholder="UserName" value={username} onChange={(e) => setusername(e.target.value)} />
                    </div>) : (<div className="userform">
                        <input type="text" id="name" name="name" placeholder="UserName" value={username} onChange={(e) => setusername(e.target.value)} /><br />
                        <input type="text" name="roomid" id="roomid" placeholder="Room-ID" value={roomid} onChange={(e) => setroomid(e.target.value)} />
                    </div>)}
                <button type="submit" onClick={handlesubmit}>Create/Join</button>
            </div>
            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    </>
}
export default LoginPage;