import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom'
import { useLocation } from 'react-router';
import './room.css';
import image from '../assets/f2d52ba8-4a3f-4fc8-ba58-7cc87f0aaaf8.jpg'
import AceEditor from 'react-ace'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-javascript";


import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-tomorrow";
import "ace-builds/src-noconflict/theme-kuroir";
import "ace-builds/src-noconflict/theme-twilight";
import "ace-builds/src-noconflict/theme-xcode";
import "ace-builds/src-noconflict/theme-textmate";
import "ace-builds/src-noconflict/theme-solarized_dark";
import "ace-builds/src-noconflict/theme-solarized_light";
import "ace-builds/src-noconflict/theme-terminal";


import "ace-builds/src-noconflict/ext-language_tools"

ace.config.set('basePath', 'path')
const availablelanguages = [
    { value: "java", label: "Java" },
    { value: 'c', label: 'C' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'cpp', label: 'Cpp' }
]
const availablethemes = [
    { value: "github", label: "github" },
    { value: "monokai", label: "monokai" },
    { value: "tomorrow", label: "tomorrow" },
    { value: "kuroir", label: "kuroir" },
    { value: "twilight", label: "twilight" },
    { value: "xcode", label: "xcode" },
    { value: "textmate", label: "textmate" },
    { value: "solarized_dark", label: "solarized_dark" },
    { value: "solarized_light", label: "solarized_light" },
    { value: "terminal", label: "terminal" }
]
export default function Room({ socket }) {
    const [selectedlanguage, setselectedlanguage] = useState(availablelanguages[3].value);
    const [selectedtheme, setselectedtheme] = useState(availablethemes[0].value)
    const { state } = useLocation();
    const { username } = state || { username: '' }
    const { roomid } = useParams();
    const [connectedClients, setConnectedClients] = useState(() => "");
    // const [initialCode, setInitialCode] = useState("");
    const [code, setCode] = useState("");
    const [output, setOutput] = useState('');

    useEffect(() => {
        setselectedlanguage(availablelanguages[3].value)
        setselectedtheme(availablethemes[0].value)
    }, [roomid])

    useEffect(() => {
        socket.on("initial-code", (initialcode) => {
            // setInitialCode(initialcode);
            setCode(initialcode);
        })
        const shortenUsername = (username) => {
            if (username.length < 7) {
                const words = username.split(" ");
                return words[0];
            }
            return username.substring(0, 7) + "...";
        };
        socket.on("update-connected-clients", (connectedClients) => {
            // toast.success(`${shortenUsername(username)} joined the room`)
            setConnectedClients(connectedClients);
        });
    }, [socket]);

    useEffect(() => {
        socket.on("update-code", (code) => {
            setCode(code)
        })
    }, [socket])

    function handlecodechange(code) {
        setCode(code);
        socket.emit("code-changed", code)
    }

    const handleRunClick = async () => {
        const spinnerContainer = document.querySelector('#lds-heart-container');
        const input = document.querySelector('.input-area').value;
        document.getElementById("runbutton").disabled = true;
        loadingSpinner.classList.remove('hidden');
        spinnerContainer.classList.remove('hidden');

        setOutput('');
        try {
            const response = await fetch('https://coderealm.onrender.com/output', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: code, language: selectedlanguage, input: input }),
            })

            if (response.ok) {
                document.getElementById("runbutton").disabled = false;
                loadingSpinner.classList.add('hidden');
                spinnerContainer.classList.add('hidden');
                const result = await response.json();
                if (result.error != undefined) {
                    setOutput(result.error);
                    return;
                }
                setOutput(result.output);
            } else {
                document.getElementById("runbutton").disabled = false;
                loadingSpinner.classList.add('hidden');
                spinnerContainer.classList.add('hidden');
                setOutput("Execution Error :(");
            }
        } catch (err) {
            document.getElementById("runbutton").disabled = false;
            loadingSpinner.classList.add('hidden');
            spinnerContainer.classList.add('hidden');
            alert('Error: Server is not running. Please check the server status and try again.');
            return;
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                alert('User ID copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    };

    return <>
        <div className="homecontainer">
            <div className="navbar">
                <div className="brand">
                    <img src={image} alt="CodeHub" />
                    CodeHub</div>
                <div className="user-info">
                    <span>Username: {username}</span>
                    <span>Room ID: {roomid}
                    <i
                                className="fas fa-copy ml-3"
                                style={{ cursor: 'pointer' }} 
                                onClick={() => copyToClipboard(roomid)}
                                title="Copy User ID"
                            >
                            </i>
                    </span>
                    <span>Connected:{connectedClients}</span>
                </div>
            </div>

            <div className="bottom-box">
                <div className="editorcontainer">
                    <div className="editornav">
                        <div className="inputs">
                            <label htmlFor="language">Select Language: </label>
                            <select
                                name="language"
                                id="language"
                                value={selectedlanguage}
                                onChange={(e) => setselectedlanguage(e.target.value)}
                            >
                                {availablelanguages.map((language, index) => (
                                    <option key={index} value={language.value} >{language.label}</option>
                                ))}</select>

                            <label htmlFor="theme">Select theme: </label>
                            <select
                                name="theme"
                                id="theme"
                                value={selectedtheme}
                                onChange={(e) => { setselectedtheme(e.target.value) }}>
                                {availablethemes.map((theme, index) => (
                                    <option key={index} value={theme.label}>{theme.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="run">
                            <button className="runbutton" id="runbutton" onClick={handleRunClick}>Run</button>
                            <div id="loadingSpinner" class="hidden"></div>
                        </div>
                    </div>
                    <AceEditor className="editor"
                        width="auto"
                        value={code}
                        mode={selectedlanguage}
                        placeholder="Enter your Code here"
                        theme={selectedtheme}
                        fontSize={15}
                        showPrintMargin={true}
                        showGutter={true}
                        onChange={handlecodechange}
                        name="UNIQUE_ID_OF_DIV"
                        editorProps={{ $blockScrolling: true }}
                        setOptions={{
                            enableBasicAutocompletion: true,
                            enableLiveAutocompletion: true,
                            enableSnippets: true
                        }}
                    />
                </div>
                <div className="output-box">
                    <div id="output"><p>{output ? output : "Your Output Will be Displayed Here"}</p>
                        <div id="lds-heart-container" className="hidden">
                            <div class="lds-heart"><div></div></div>
                        </div>
                    </div>
                    <div className="input">
                        <textarea placeholder="Enter your input here" className="input-area"></textarea>
                    </div>
                </div>
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
