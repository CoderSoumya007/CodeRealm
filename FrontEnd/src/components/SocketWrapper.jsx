import React,{ useEffect } from "react";
import {io}  from "socket.io-client";
import {useLocation,useNavigate,useParams} from "react-router-dom"

function addPropsToReactElement(element, props) {
    if (React.isValidElement(element)) {
        return React.cloneElement(element, props)
    }
    return element
}

function addPropsToChildren(children, props) {
    if (!Array.isArray(children)) {
        return addPropsToReactElement(children, props)
    }
    return children.map(childElement =>
        addPropsToReactElement(childElement, props)
    )
}   

export default function SocketWrapper({children}){
    const socket=io.connect("http://13.51.172.71:5000");

    const location=useLocation();
    const {roomid}=useParams();
    const navigate=useNavigate();

    useEffect(() => {
        const kickstrangerout = () => {
            navigate('/', { replace: true });
        };
    
        location.state?.username ? socket.emit('when a user joins', { roomid, username: location.state.username }) : kickstrangerout();
    }, [location.state?.username, roomid, socket]);
    

    return location.state && location.state.username ? <div>{addPropsToChildren(children, { socket })}</div> : (
        <div className="room">
            <h2>No username provided. Please use the form to join a room.</h2>
        </div>
    )

}