import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export default function EditBrain(props) {

    const [brainName, setBrainName] = useState(props.name);
    const [brainDescription, setBrainDescription] = useState(props.description);
    const [brainFiles, setBrainFiles] = useState(props.files);
    
    const [tempBrain, setTempBrain] = useState();
    const [notFound, setNotFound] = useState();

    /* Modal toggle logic */
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <button onClick={handleShow} className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                Edit
            </button>

            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Edit Brain</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <form 
                        id='edit-brain' 
                        className="w-full max-w-lg"
                        onSubmit={(e) => {
                            e.preventDefault();
                            console.log(props.id, brainName, brainDescription, brainFiles)
                            props.updateBrain(props.id, brainName, brainDescription, brainFiles);
                        }}
                    >
                        {/* Brain Name */}
                        <div className="flex flex-wrap -mx-3 mb-1">
                            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-first-name">
                                    Brain Name
                                </label>
                                <input 
                                    className="appearance-none h-10 block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white" 
                                    id="brain-name" 
                                    value={brainName}
                                    type="text" 
                                    placeholder="Name"

                                    onChange={(e) => {
                                        setBrainName(e.target.value)
                                    }}
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
                                    type="text"
                                    placeholder="Brain Description"

                                    onChange={(e) => {
                                        setBrainDescription(e.target.value)
                                    }}
                                />
                                <p className="text-gray-600 text-xs italic">Make it as long and as crazy as you'd like</p>
                            </div>
                        </div>
                        {/* Upload Files */}
                        <div className="flex flex-wrap -mx-3 mb-1">
                            <div className='w-full px-3'>
                                <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="multiple_files">Upload multiple files</label>
                                <input className="appearance-none h-10 block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="multiple_files"
                                    type="file" 
                                    multiple 
                                />
                            </div>
                        </div> 
                        {/* File List */}
                        <div className="flex flex-wrap -mx-3 mb-1">
                            <div className='w-full px-3'>
                                <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="multiple_files">
                                    Uploaded files
                                </label>
                                {/* I will impllement this late i acc cba] */}
                            </div>
                        </div>
                    </form>

                </Modal.Body>
                <Modal.Footer>
                    <button onClick={handleClose} className='py-2 px-4 ms-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700'>
                        Cancel
                    </button>
                    <button 
                        form='edit-brain' 
                        className='inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
                        onClick={handleClose}
                    >
                        Update
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    );
}