import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'

/* import components */
import Navbar from './components/Navbar';

/* import pages */
import FileManager from './pages/FileManager';
import Chat from './pages/Chat';



function App() {
  return (
    <div className='App flex-1 overflow-auto'>

      <div className='h-screen p-2 flex flex-row overflow-hidden'>
        
        <div className='flex-grow'>
          <BrowserRouter >   
              <Navbar>
                <Routes>
                  <Route path='/' element={<Chat />} />
                  <Route path='/filemanager' element={<FileManager />} />
                </Routes>
              </Navbar>
          </BrowserRouter>
        </div>
      </div>

    </div>

    );
}

      export default App;
