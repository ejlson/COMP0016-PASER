import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import { FileUploader } from 'react-drag-drop-files';

export default function EditBrain(props) {

    const [brainName, setBrainName] = useState(props.name);
    const [brainDescription, setBrainDescription] = useState(props.description);
    const [brainFiles, setBrainFiles] = useState(props.files);

    const [brain, setBrain] = useState();
    const [tempBrain, setTempBrain] = useState();
    const [tempBrainName, setTempBrainName] = useState(props.name);
    const [tempBrainDescription, setTempBrainDescription] = useState(props.description);
    const [tempBrainFiles, setTempBrainFiles] = useState(props.files);
    const [notFound, setNotFound] = useState();

    /* Modal toggle logic */
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    /* New files upload logic */
    const [newFiles, setNewFiles] = useState([]);
    const [filesToDelete, setFilesToDelete] = useState([]);

    // Handler for marking an existing file for deletion
    const handleDeleteExistingFile = (fileId) => {
        setFilesToDelete([...filesToDelete, fileId]);
        setBrainFiles(brainFiles.filter(file => file.id !== fileId));
    };

    // Handler for removing a new file from the upload list
    const handleRemoveNewFile = (fileIndex) => {
        setNewFiles(newFiles.filter((_, index) => index !== fileIndex));
    };

    const handleMarkFileForDeletion = (fileId) => {
        setFilesToDelete(prev => [...prev, fileId]);
    };

    const handleFileUpload = (fileOrFiles) => {
        // Assuming 'files' is an array of file objects
        // Append the newly selected files to the existing 'newFiles' state
        const filesArray = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
        setNewFiles(prevFiles => [...prevFiles, ...filesArray]);

        // Update UI immediately for user feedback
        const updatedBrainFiles = [...brainFiles];
        // filesArray.forEach(file => {
        //     const filePreview = URL.createObjectURL(file);
        //     updatedBrainFiles.push({ file: filePreview, name: file.name, isNew: true });
        // });
        // setBrainFiles(updatedBrainFiles);
        filesArray.forEach(file => {
            if (file instanceof File) {
                const filePreview = URL.createObjectURL(file);
                updatedBrainFiles.push({
                    file: filePreview, // URL for use in <img> src or similar
                    name: file.name,
                    isNew: true // Mark the file as new
                });
            }
        });
        setBrainFiles(updatedBrainFiles);  // Update state to trigger re-render
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        newFiles.forEach((file) => {
            formData.append('files', file);
        });
        // Assuming 'filesToDelete' contains the IDs of files to delete
        formData.append('filesToDelete', JSON.stringify(filesToDelete));
        formData.append('name', brainName);
        formData.append('description', brainDescription);
        const csrfToken = getCookie('csrftoken');
        // Adjust the URL and headers as necessary
        fetch(`http://localhost:8000/brains/${props.id}/`, {
            method: 'PATCH',
            body: formData,
            headers: {
                'X-CSRFToken': csrfToken,
            },
            // Headers may need to include CSRF token etc., depending on your backend setup
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data && data.brain) {
                setBrainFiles(data.brain.files); // Update local state if needed
                props.onUpdateBrain(data.brain); // Notify parent component about the update
            }
            setNewFiles([]); // Clear newFiles as they are now part of brainFiles
            handleClose(); // Close the modal on success
        })
        .catch(error => {
            console.error('Error updating brain:', error);
        });
    };
    

    useEffect(() => {
        fetch('http://localhost:8000/api/brains/' + props.id)
            .then((response) => {
                if (response.status === 404) {
                    setNotFound(true);
                }
                return response.json();
            })
            .then((data) => {
                setBrain(data.brain);
                setTempBrain(data.brain);
            })
    }, []);

    /* DELETE FILES IN BRAIN */

    function getCookie(name) {
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
    }

    const fileTypes = ["JPEG", "PNG", "GIF", "PPTX", "PDF"];


    return (
        <>
            <button onClick={handleShow} className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                Edit
            </button>

            <Modal
                size='xl'
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
                        className="w-full"
                        // onSubmit={ (e) => {
                        //     // {
                        //     e.preventDefault();
                        //     console.log(props.id, brainName, brainDescription, brainFiles)
                        //     props.updateBrain(props.id, brainName, brainDescription, brainFiles);
                        //     }
                        //     // handleSubmit
                        // }
                        onSubmit={handleSubmit}
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
                                        // setTempBrain({
                                        //     ...tempBrain,
                                        //     name:  e.target.value,
                                        // });
                                        setBrainName(e.target.value);
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

                                    // onChange={(e) => {
                                    //     setTempBrain({
                                    //         ...tempBrain,
                                    //         description:  e.target.value,
                                    //     });
                                    // }}
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
                                {/* <input
                                    className=""
                                    id="multiple_files"
                                    type="file"
                                    multiple
                                    placeholder='Upload file'
                                    onChange={(e) => setNewFiles([...newFiles, ...e.target.files])} // Append new files to the existing list
                                /> */}
                                <FileUploader 
                                    name="file" 
                                    types={fileTypes} 
                                    multiple={true} 
                                    handleChange={handleFileUpload} 
                                    onChange={(e) => setNewFiles([...newFiles, ...e.target.files])}
                                />
                            </div>
                        </div>
                        {/* File List */}
                        <div className="flex flex-wrap -mx-3 mb-1">
                            <div className='w-full px-3'>
                                <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="multiple_files">
                                    Uploaded files
                                </label>
                                <ul className='space-y-2'>
                                    {brainFiles.map((file, index) => (
                                        <li key={index} className='flex flex-row border border-gray-400 px-4 py-2'>
                                            {file.file}
                                            <button onClick={() => setFilesToDelete([...filesToDelete, file.id])} className='inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700'>Delete</button>
                                        </li>
                                    ))}
                                </ul>
                                <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="multiple_files">
                                    New files
                                </label>
                                <ul className='space-y-2'>
                                    {newFiles.map((file, index) => (
                                        <li key={`new-${index}` } className='flex flex-row border border-gray-400 px-4 py-2'>
                                            New File: {file.file}
                                            <button 
                                                onClick={() => handleMarkFileForDeletion(file.id)}
                                                className='inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700'
                                            >
                                                Remove
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </form>

                </Modal.Body>
                <Modal.Footer>
                    <button
                        onClick={handleClose}
                        className='py-2 px-4 ms-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700'
                    >
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