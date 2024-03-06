import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export default function AddBrain(props) {

    const [brainName, setBrainName] = useState('');
    const [brainDescription, setBrainDescription] = useState('');

    /* File Upload Logic */
    const [file, setFile] = useState([]);
    const [status, setStatus] = useState('');
    const handleFileChange = (e) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };
    const handleUpload = async () => {
        if (file) {
            console.log('uploading file: ' + file.name);
            const formData = new FormData();
            formData.append('file', file);

            try {
                const result = await fetch('http://localhost:8000/api/brains/', {
                    method: 'POST',
                    body: formData
                });
                const data = await result.json();
                console.log(data);
                setStatus('File uploaded successfully');
            } catch (error) {
                console.log(error);
                setStatus('File upload failed');
            }
        }
    };
    
    /* Modal toggle logic */
    const [show, setShow] = useState(props.show);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <div className="w-[250px] max-w-sm bg-white border-dashed border-2 border-blue-700 rounded-lg shadow-xl shadow-blue-gray-900/4 dark:bg-gray-800 dark:border-gray-700 m-2">
                <div className="flex flex-col items-center pb-4 px-4 pt-4">
                    <div className="flex mt-7 md:mt-16">
                        {props.editBrain}
                        <button
                        onClick={props.toggleShow}
                        className="block mx-auto m-2 inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        >
                        + Add Brain
                        </button>
                    </div>
                </div>
            </div>

            <Modal  
                size='xl'
                show={props.show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Add Brain</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <form
                        id='edit-brain'
                        className="w-full max-w-lg"
                        onSubmit={(e) => {
                            e.preventDefault();
                            setBrainName('');
                            setBrainDescription('');
                            props.newBrain(brainName, brainDescription);
                        }}
                    >
                        {/* Brain Name */}
                        <div className="flex flex-wrap -mx-3 mb-1">
                            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-first-name">
                                    Brain Name
                                </label>
                                <input className="appearance-none h-10 block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                                    id="brain-name"
                                    value={brainName}
                                    onChange={(e) => {
                                        setBrainName(e.target.value)
                                    }}
                                    type="text"
                                    placeholder="Brain Name"
                                />
                            </div>

                        </div>
                        {/* Brain Description */}
                        <div className="flex flex-wrap -mx-3 mb-1">
                            <div className="w-full px-3">
                                <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-password">
                                    Description
                                </label>
                                <input
                                    rows='4'
                                    className="appearance-none h-10 block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="brain-description"
                                    value={brainDescription}
                                    onChange={(e) => {
                                        setBrainDescription(e.target.value)
                                    }}
                                    type="text"
                                    placeholder="Brain Description"
                                />
                                <p className="text-gray-600 text-xs italic">Make it as long and as crazy as you'd like</p>
                            </div>
                        </div>
                        {/* Upload Files */}
                        <div className="flex flex-wrap -mx-3 mb-1">
                            <div className='w-full px-3'>
                                <label 
                                    className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="multiple_files">
                                    Upload multiple files
                                </label>
                                <input 
                                    className=""
                                    id="files"
                                    type="file"
                                    onChange={handleFileChange}
                                    multiple
                                />
                                {file && (
                                    <section>
                                        File details:
                                        <ul>
                                            <li>Name: {file.name}</li>
                                            <li>Type: {file.type}</li>
                                            <li>Size: {file.size} bytes</li>
                                        </ul>
                                    </section>
                                )}
                                {file && 
                                    <button 
                                        className='py-2 px-4 ms-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700'
                                        onClick={handleUpload}
                                    >
                                        Upload a file
                                    </button>}
                            </div>
                        </div>
                    </form>

                </Modal.Body>
                <Modal.Footer>
                    <button onClick={props.toggleShow} className='py-2 px-4 ms-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700'>
                        Cancel
                    </button>
                    <button
                        form='edit-brain'
                        className='inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
                        
                    >
                        Add Brain
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    );
}