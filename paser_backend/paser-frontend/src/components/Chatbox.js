import React from "react";

/* import assets */
import botIcon from "../assets/bot-icon.png";
import userIcon from "../assets/user-icon.png";

/*
export default function Chatbox({ messages }) {
    return(
        <div className='flex flex-col justify-between w-[900px]'>
            <div class='overflow-y-auto p-2'>
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'} mb-2`}>
                        <div class="flex items-center">
                            <div className={`p-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
                                <div className="flex items-center">
                                    <img 
                                        src={msg.sender === 'user' ? userIcon : botIcon} 
                                        alt={msg.sender} 
                                        className="h-6 w-6 rounded-full mr-2"
                                    />
                                    <span>{msg.sender === 'user' ? 'You' : 'Paser'}</span>
                                </div>
                                <p>{msg.text}</p>
                            </div>
                        </div>  
                    </div>
                ))}
            </div>
        </div>
    );
}
*/

export default function Chatbox({ messages }) {
    return(
        <div className='flex flex-col flex-wrap justify-between w-[1050px] py-3'>
            <div className='overflow-y-auto p-2 h-[calc(100vh-10rem)]'>
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender === 'user' ? 'mb-4 flex justify-end' : 'mb-4 flex justify-start'} flex-wrap`}>
                        <div className={`p-2 rounded-lg ${msg.sender === 'user' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : 'bg-gray-300'} max-w-md flex-wrap`}>
                            <div className="flex items-center">
                                <img 
                                    src={msg.sender === 'user' ? userIcon : botIcon} 
                                    alt={msg.sender} 
                                    className="h-6 w-6 rounded-full mr-2"
                                />
                                <span>{msg.sender === 'user' ? 'You' : 'Paser'}</span>
                            </div>
                            <p>{msg.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}