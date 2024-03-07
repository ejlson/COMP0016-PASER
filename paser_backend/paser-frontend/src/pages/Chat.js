import React, { useState, useRef, useEffect } from 'react';

/* import components */
import Sidebar from '../components/Sidebar';
import Input from '../components/Input';
import Chatbox from '../components/Chatbox';
import userIcon from '../assets/user-icon.png';
import botIcon from '../assets/bot-icon.png';

// export default function Chat() {

// // INPUT FIELD
// const [messages, setMessages] = React.useState([]);
// const [userInput, setUserInput] = React.useState('');

// const handleSendMessage = (newMessage) => {
//   const updatedMessages = [...messages, { text: newMessage, sender: 'user' }];
//   setMessages(updatedMessages);

//     // Simulate a bot response. In a real scenario, this would come from your backend
//     setTimeout(() => {
//       setMessages([...updatedMessages, {
//         text:
//           'The Climate and Clean Air Coalition in 2015 and 2016 had different focuses and initiatives. In 2015, the coalition implemented 11 high-impact initiatives in various sectors to reduce black carbon, methane, and avoid hydrofluorocarbon emissions. These initiatives aimed to curb greenhouse gas emissions and reduce the health impacts of air pollution. The coalition also grew to 110 partners with combined pledges worth $75 million. In contrast, in 2016, the coalition shifted its focus to supporting global efforts to reduce emissions of short-lived climate pollutants, such as black carbon and methane, in order to protect the environment and promote sustainable development. The key initiatives in 2016 included supporting countries in achieving climate resilience, promoting low-emission growth, and enabling countries to capitalise on investment opportunities that reduce greenhouse emissions from deforestation and forest degradation. The coalition also worked with East African countries to explore their potential for solar water heating systems and helped countries access technologies related to sustainable development. Overall, while both years saw the coalition working towards reducing emissions and addressing air pollution, the specific initiatives and areas of focus differed between 2015 and 2016.', sender: 'bot'
//       }]);
//     }, 1000);

//     // implement sending messages to backend later

//   };

// // =============== CHAT LOGIC ===============
// const fetchChatbotResponse = async () => {

//   try {

//     const response = await fetch('/chatbot/', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'X-CSRFToken': getCookie('csrftoken'),
//       },
//       body: JSON.stringify({ message: userInput })
//     });
//     const data = await response.json();
//     setMessages([...messages, { sender: 'user', text: userInput }, { sender: 'bot', text: data.response }]);

//     // Clear the user input
//     setUserInput('');

//   } catch (error) {
//     console.error('Error fetching chatbot response', error);
//   }
// };

// // Helper function to get cookie (used for CSRF protection)
// function getCookie(name) {
//   let cookieValue = null;
//   if (document.cookie && document.cookie !== '') {
//       const cookies = document.cookie.split(';');
//       for (let i = 0; i < cookies.length; i++) {
//           const cookie = cookies[i].trim();
//           if (cookie.substring(0, name.length + 1) === (name + '=')) {
//               cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//               break;
//           }
//       }
//   }
//   return cookieValue;
// }

// // handle funciton to render chat messages
// const handleKeyDown = (e) => {
//   if (e.key === 'Enter') {
//     e.preventDefault();
//     fetchChatbotResponse();
//   }
// }

// //helper function to render chat messages
// const renderMessages = () => {
//   return messages.map((message, index) => {
//     return (
//       <div key={index} className={`chat-message ${message.type}-message`}>
//         <h3>{message.type == 'user' ? 'You' : 'Bot'}:</h3>
//         <p>{message.text}</p>
//       </div>
//     );
//   });
// };

// ==============================================================================

// const [inputValue, setInputValue] = useState('');
// const [messages, setMessages] = useState([]);
// const inputRef = useRef(null);
// const chatContainerRef = useRef(null);

// const sendMessage = () => {
//   setMessages([...messages, inputValue]);
//   setInputValue(''); // Clear input field after sending message
//   chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight; // Scroll to bottom of chat container
// };

// return (
//   <>
//     <div className="flex flex-wrap flex-1 grid grid-flow-col gap-4 -mx-2 px-2"> {/* overflow-auto */}
//       <Sidebar />
//       <div className="flex flex-wrap justify-center grid grid-rows-2">
//         {/* {renderMessages()} */}
//         {/* <Chatbox messages={messages} className=''/> */}

//         <div className='flex justify-center'>
//           {/* <input
//             id="userInput"
//             type="text"
//             value={userInput}
//             onChange={(e) => setUserInput(e.target.value)}
//             onKeyDown={handleKeyDown}
//           /> */}
//           {/* <Input 
//             onSendMessage={handleSendMessage} 
//             id = "userInput"
//             value={userInput}
//             onChange={(e) => setUserInput(e.target.value)}
//             className=''
//           /> */}
//           <div ref={chatContainerRef} style={{ height: '300px', overflowY: 'scroll' }}>
//             {messages.map((message, index) => (
//               <div key={index}>{message}</div>
//             ))}
//           </div>
//           <input
//             ref={inputRef}
//             value={inputValue}
//             onChange={(e) => setInputValue(e.target.value)}
//             type="text"
//           />
//           <button onClick={sendMessage}>Send</button>
//         </div>
//       </div>

//     </div>
//   </>
// );

// ==============================================================================

// }

const ChatComponent = () => {

  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [brains, setBrains] = useState([]);
  const chatContainerRef = useRef(null);

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

  const sendMessage = () => {
    if (!userInput.trim()) return;

    const newMessage = { type: 'user', text: userInput };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    console.log('sending message...');

    // YOU MAY HAVE TO CHANGE THIS

    const currentUrl = new URL(window.location.href);
    const baseUrl = `${currentUrl.protocol}//${currentUrl.host}/`;

    fetch('/api/chatbot/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
      body: JSON.stringify({ message: userInput })
    })
      .then(response => response.json())
      .then(data => {
        const botMessage = { type: 'bot', text: data.response };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
        console.log(data.message)
        console.log('received chatbots response');
        console.log("base url: " + baseUrl);
      }).catch((e) => {
        console.log('error fetching chatbot response: ', e);
      });

    setUserInput(''); // Clear the input after sending
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

  const handleUserInputChange = (e) => {
    setUserInput(e.target.value);
    if (e.target.value.includes('@')) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className='flex flex-wrap min-h-screen flex-1 grid grid-flow-col gap-2 -mx-2 px-2'>
      <Sidebar />
      <div className="flex flex-col flex-1 h-screen p-2">
        <div className="flex flex-col h-full overflow-hidden">
          <div
            ref={chatContainerRef}
            id="chatContainer"
            className="flex flex-col w-[calc(130vh)] h-[calc(100vh-8rem)] overflow-y-auto p-2 space-y-2 bg-transparent"
          >
            {messages.map((message, index) => (
              <div key={index} className={`chat-message ${message.type}-message ${message.type === 'user' ? 'self-end p-1 rounded-lg bg-gray-100 max-w-md ' : 'self-start p-1 rounded-lg bg-gray-100 max-w-md '} rounded p-2`}>
                <div className="flex items-center">
                <img
                  src={message.type === 'user' ? userIcon : botIcon}
                  alt={message.type}
                  className="h-6 w-6 rounded-full mr-2"
                />
                <strong>{message.type === 'user' ? 'You' : 'Paser'}</strong>
                </div>
                <span className="block text-sm">{message.text}</span>
              </div>
            ))}
          </div>
          <div className="p-4 bg-white relative flex w-full max-w-[45rem]">
            <div className='relative h-10 w-full mr-2 min-w-[200px]'>
              <input
                type="text"
                value={userInput}
                onChange={handleUserInputChange}
                onKeyDown={handleKeyDown}
                id="userInput"
                placeholder=" "
                className='peer h-full w-full shadow shadow-blue-gray-900/4 mr-2 rounded-[7px] border border-blue-gray-200 border-t-transparent bg-transparent px-3 py-2.5 pr-20 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-gray-900 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50'
              // className="w-full mr-2 border border-blue-gray-200 border-t-transparent bg-transparent relative h-10 w-full min-w-[200px] p-3 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
              {/* {showSuggestions ? showSuggestions && (
                <div className="suggestions-dropdown">
                  {brains.map((brain, index) => (
                    <div key={index} onClick={() => handleSelectBrain(brain.name)}>
                      {brain.name}
                    </div>
                  ))}
                </div>
              ) : null} */}
              <label
                className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none !overflow-visible truncate text-[11px] font-normal leading-tight text-gray-500 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-gray-900 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:!border-gray-900 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:!border-gray-900 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                Talk to Paser
              </label>

            </div>
            <button
              onClick={sendMessage}
              className="bg-gradient-to-r shadow shadow-blue-gray-900/4 from-cyan-500 to-blue-500 text-white hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Send
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ChatComponent;
