import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import { FileUploader } from 'react-drag-drop-files';

export default function EditBrain(props) {

    const [brainName, setBrainName] = useState(props.name);
    const [brainDescription, setBrainDescription] = useState(props.description);
    const [brainFiles, setBrainFiles] = useState(props.files);

    /* Modal toggle logic */
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    /* New files upload logic */
    const [files, setFiles] = useState([]);
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

    /* Validate brain name with similar logic as the AddBrain component */
    const [brainNameError, setBrainNameError] = useState('');
    const validateBrainName = () => {
        const regex = /^[a-zA-Z0-9 ]+$/;
        if (brainName.length < 3 && !regex.test(brainName)) {
            setBrainNameError("Brain name must be at least 3 characters long and cannot contain special characters.");
            return false;
        } else if (brainName.length < 3) {
            setBrainNameError("Brain name must be at least 3 characters long.");
            return false;
        } else if (!regex.test(brainName)) {
            setBrainNameError("Brain name cannot contain special characters.");
            return false;
        }
        setBrainNameError(""); // No error
        return true;
    };

    const handleFileUpload = (fileOrFiles) => {
        const filesArray = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
        setNewFiles(prevFiles => [...prevFiles, ...filesArray]);
        const updatedBrainFiles = [...brainFiles];
        filesArray.forEach(file => {
            if (file instanceof File) {
                const filePreview = URL.createObjectURL(file);
                updatedBrainFiles.push({
                    file: filePreview,
                    name: file.name,
                    isNew: true
                });
            }
        });
        setBrainFiles(updatedBrainFiles);
        console.log(updatedBrainFiles);
        // const filesArray = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
        // const newFilesWithPreview = filesArray.map(file => ({
        //     id: null,
        //     file: URL.createObjectURL(file), 
        //     name: file.name,
        //     isNew: true, 
        // }));

        // setNewFiles(prev => [...prev, ...filesArray]);
        // setBrainFiles(prev => [...prev, ...newFilesWithPreview]);
    };

    // const handleFileUpload = (fileOrFiles) => {
    //     const filesArray = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
    //     const newFilesWithPreview = filesArray.map(file => ({
    //         id: null, // Assuming existing files have an 'id' from the backend and new ones don't yet
    //         file: URL.createObjectURL(file), // For immediate preview
    //         name: file.name,
    //         isNew: true // Flag to identify new files
    //     }));

    //     setBrainFiles(prevFiles => [...prevFiles, ...newFilesWithPreview]);
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateBrainName()) {
            return;
        }
        const formData = new FormData();
        newFiles.forEach((file) => {
            formData.append('files', file);
        });
        formData.append('filesToDelete', JSON.stringify(filesToDelete));
        formData.append('name', brainName);
        formData.append('description', brainDescription);
        const csrfToken = getCookie('csrftoken');
        // Adjust the URL and headers as necessary
        // fetch(`http://localhost:8000/brains/${props.id}/`, {
        //     method: 'PATCH',
        //     body: formData,
        //     headers: {
        //         'X-CSRFToken': csrfToken,
        //     },
        // })
        //     .then(response => response.json())
        //     .then(data => {
        //         console.log(data);
        //         if (data && data.brain) {
        //             setBrainFiles(data.brain.files);
        //             props.onUpdateBrain(data.brain);
        //             setNewFiles([]);
        //             handleClose();
        //         }
        //     })
        //     .catch(error => {
        //         console.error('Error updating brain:', error);
        //     });
        try {
            const response = await fetch(`http://localhost:8000/brains/${props.id}/`, {
                method: 'PATCH',
                body: formData,
                headers: {
                    'X-CSRFToken': csrfToken,
                },
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log(data);
            if (data && data.brain) {
                setBrainFiles(data.brain.files);
                props.onUpdateBrain(data.brain);
                setNewFiles([]);
                setShow(false);
            }
        } catch (error) {
            console.error('Error updating brain:', error);
        }
        window.location.reload();
    };

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
                size='l'
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Edit Brain</Modal.Title>
                </Modal.Header>
                <Modal.Body className="max-h-[73vh] overflow-auto space-y-6">

                    <form
                        id='edit-brain'
                        className="w-full space-y-4"
                        onSubmit={handleSubmit}
                    >
                        {/* Brain Name */}
                        <div className="mb-4">
                            <label htmlFor="brain-name" className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                                Brain Name
                            </label>
                            <input
                                id="brain-name"
                                type="text"
                                value={brainName}
                                onChange={(e) => setBrainName(e.target.value)}
                                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                required
                            />
                            <div className="mt-1">
                                {brainNameError && <p className="text-red-500 text-xs italic mb-1">{brainNameError}</p>}
                            </div>
                            <div>
                                <p className="text-gray-600 text-xs italic">Name must be at least 3 characters long and cannot contain special characters: -`!@#$£%^&amp;*()_-+={ }[]|`:;"'&lt;,&gt;.?/</p>
                            </div>
                        </div>

                        {/* Brain Description */}
                        <div className="mb-4">
                            <label htmlFor="brain-description" className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                                Description
                            </label>
                            <textarea
                                id="brain-description"
                                value={brainDescription}
                                onChange={(e) => setBrainDescription(e.target.value)}
                                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                rows="3"
                                required
                            ></textarea>
                        </div>

                        {/* Upload Files Section */}
                        <div className="mb-4">
                            <div className="mb-2">
                                <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="multiple_files">Upload new files</label>
                                <FileUploader
                                    name="files"
                                    types={fileTypes}
                                    multiple={true}
                                    handleChange={handleFileUpload}
                                />
                            </div>
                        </div>

                        {/* Uploaded Files Section */}
                        <div className='mb-4'>
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                                Uploaded files
                            </label>
                            {/* <div className="border-t border-gray-200 pt-4 space-y-2 max-h-48 overflow-y-auto">
                                {brainFiles.map((file, index) => (
                                    <div key={index} className="flex justify-between items-center bg-white p-2 border rounded shadow-sm">
                                        <span className="text-sm">{file.file.replace('/media/brains/', '')}</span>
                                        <button
                                            onClick={() => handleDeleteExistingFile(file.id)}
                                            className="text-white bg-red-500 px-3 py-1 rounded hover:bg-red-700 transition-colors duration-150"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div> */}
                            {/* <div className="space-y-2 max-h-48 overflow-y-auto">
                                {brainFiles.map((file, index) => (
                                    <div key={index} className="flex justify-between items-center bg-white p-2 border rounded shadow-sm">
                                        <span className="text-sm">{file.file.replace('/media/brains/', '')}</span>
                                        <button
                                            onClick={() => file.isNew ? handleRemoveNewFile(index) : handleDeleteExistingFile(file.id)}
                                            className="text-white bg-red-500 px-3 py-1 rounded hover:bg-red-700 transition-colors duration-150"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div> */}
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {brainFiles.map((file, index) => (
                                    <div key={index} className="flex justify-between items-center bg-white p-2 border rounded shadow-sm">
                                        {/* Show the file name for new files directly, for existing files, strip the path if needed */}
                                        <span className="text-sm">{file.isNew ? file.name : file.file.replace('/media/brains/', '')}</span>
                                        <button
                                            onClick={() => file.isNew ? handleRemoveNewFile(index) : handleDeleteExistingFile(file.id)}
                                            className="text-white bg-red-500 px-3 py-1 rounded hover:bg-red-700 transition-colors duration-150"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
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
                        type='submit'
                        form='edit-brain'
                        className='inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
                    >
                        Update
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    );
}