import React, { useState, useRef, useEffect } from 'react';

/* import components */
import { TextareaAutosize } from '@mui/base/TextareaAutosize';

import Sidebar from '../components/Sidebar';
// import Input from '../components/Input';
// import Chatbox from '../components/Chatbox';
import userIcon from '../assets/user-icon.png';
import botIcon from '../assets/bot-icon.png';

const ChatComponent = () => {

  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [brains, setBrains] = useState([]);
  const chatContainerRef = useRef(null);
  const [botsLatestResponse, setBotsLatestResponse] = useState('')

  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  // const sendMessage = () => {
  //   if (!userInput.trim()) return;

  //   const newMessage = { type: 'user', text: userInput };
  //   setMessages((prevMessages) => [...prevMessages, newMessage]);

  //   console.log('sending message...');

  //   // YOU MAY HAVE TO CHANGE THIS
  //   fetch('/api/chatbot/', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'X-CSRFToken': getCookie('csrftoken')
  //     },
  //     body: JSON.stringify({ message: userInput })
  //   })
  //     .then(response => response.json())
  //     .then(data => {
  //       const botMessage = { type: 'bot', text: data.response };
  //       setMessages((prevMessages) => [...prevMessages, botMessage]);
  //       console.log(data.message)
  //       console.log('received chatbots response');
  //     }).catch((e) => {
  //       console.log('error fetching chatbot response: ', e);
  //     });

  //   setUserInput(''); // Clear the input after sending
  // };

  /* === HANDLER FOR WHEN MESSAGE IS SENT === */
  const sendMessage = (message, isUser = true) => {
    if (!userInput.trim()) return;
    setIsTyping(true);
    if (isUser) {
      const newMessage = { type: 'user', text: message };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      console.log('sending message...');
      fetch('/api/chatbot/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ message: message })
      })
        .then(response => response.json())
        .then(data => {
          typingEffect(data.response);
          console.log(data.message)
          console.log('received chatbots response');
        }).catch((e) => {
          console.log('error fetching chatbot response: ', e);
        });
    }
    if (isUser) setUserInput('');
    setBotsLatestResponse(message);
  };

  // Automatically scroll to the bottom of the chat container when messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);


  useEffect(() => {
    if (showSuggestions) {
      fetch('/api/brains/')
        .then(response => response.json())
        .then(data => setBrains(data))
        .catch(error => console.error('Error fetching data: ', error));
    }
  }, [showSuggestions]);

  /* === HANDLER FOR WHEN USER INPUT IS CHANGED === */
  const handleUserInputChange = (e) => {
    setUserInput(e.target.value);
  };

  /* === HANDLER FOR WHEN ENTER KEY IS PRESSED === */
  const handleKeyDown = (e) => {
    if (e.keyCode === 13 || e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(userInput, true);
    }
  };

  /* === TEXT TYPING ANIMATION === */
  const [isTyping, setIsTyping] = useState(false);
  const typingEffect = (message) => {
    setIsTyping(true);
    let typedMessage = '';
    let index = 0;
    const tempMessageId = Date.now(); // Use current timestamp as a unique ID
    setMessages((prevMessages) => [...prevMessages, { type: 'bot', text: '', tempId: tempMessageId }]);
    // const typeChar = () => {
    //   if (index < message.length) {
    //     typedMessage += message.charAt(index);
    //     // setMessages((prevMessages) => [...prevMessages, { type: 'bot', text: typedMessage }]);
    //     setMessages((prevMessages) => prevMessages.map(msg =>
    //       msg.tempId === tempMessageId ? { ...msg, text: typedMessage } : msg
    //     ));
    //     index++;
    //     setTimeout(typeChar, 20);
    //   } else {
    //     setIsTyping(false);
    //   }
    // };
    // typeChar();
    setTimeout(() => {
      const typeChar = () => {
        if (index < message.length) {
          typedMessage += message.charAt(index);
          // setMessages((prevMessages) => [...prevMessages, { type: 'bot', text: typedMessage }]);
          setMessages((prevMessages) => prevMessages.map(msg =>
            msg.tempId === tempMessageId ? { ...msg, text: typedMessage } : msg
          ));
          index++;
          setTimeout(typeChar, 10);
        } else {
          setIsTyping(false);
        }
      };
      typeChar();
    }, 2000);
  };

  return (
    <div className='flex flex-wrap min-h-screen flex-1 grid grid-flow-col gap-2 -mx-2 px-2'>
      {/* <Sidebar /> */}
      <div className="flex flex-col flex-1 h-screen p-2 justify-center items-center">
        <div className="flex flex-col h-full overflow-hidden justify-center items-center">
          <div
            ref={chatContainerRef}
            id="chatContainer"
            className="flex flex-col w-[calc(130vh)] h-[calc(100vh-8rem)] overflow-y-auto p-2 pt-2 pb-0.5 space-y-2 bg-transparent"
          >
            {messages.map((message, index) => (
              <div key={index} className={`chat-message ${message.type}-message ${message.type === 'user' ? 'self-end p-1 rounded-lg max-w-[calc(80vh)] ' : 'self-start p-1 rounded-lg max-w-[calc(80vh)] '} rounded p-2 break-words bg-gray-400 backdrop-filter backdrop-blur-lg bg-opacity-30 text-white shadow shadow-blue-gray-900/4`}>
                <div className="flex items-center py-2 px-1">
                  <img
                    src={message.type === 'user' ? userIcon : botIcon}
                    alt={message.type}
                    className="h-6 w-6 rounded-full mr-2 invert"
                  />
                  <strong className='text-white'>{message.type === 'user' ? 'You' : 'Paser'}</strong>
                </div>
                <span className="block text-sm px-2">
                  {/* {message.text} */}
                  {message.text.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="block text-sm text-white">{paragraph}</p>
                  ))}
                </span>
              </div>
            ))}
          </div>
          <div className="pt-1 pb-4 bg-transparent relative flex w-full max-w-[65rem] justify-center items-center">
            <div
              // className='relative h-10 w-full mr-2 min-w-[200px]'
              className='relative w-full max-w-[calc(100%-3rem)]'
            >
              <div className="p-4 bg-transparent relative flex w-full max-w-[65rem] items-center">
                <TextareaAutosize
                  disabled={isTyping}
                  type="text"
                  value={userInput}
                  onChange={handleUserInputChange}
                  onKeyDown={handleKeyDown}
                  minRows={1}
                  maxRows={6}
                  id="userInput"
                  placeholder={isTyping ?
                    "Paser is typing..." :
                    "Type your message here..."
                  }
                  className='flex-grow shadow shadow-blue-gray-900/4 mr-2 rounded-[7px] border border-blue-gray-200 backdrop-filter backdrop-blur-lg bg-opacity-30 px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all focus:border-2 focus:border-gray-900 focus:outline-0'
                />
                <button
                  disabled={isTyping}
                  onClick={() => sendMessage(userInput)}
                  className="resize-none bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 shadow shadow-blue-gray-900/4"
                >
                  Send
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ChatComponent;
