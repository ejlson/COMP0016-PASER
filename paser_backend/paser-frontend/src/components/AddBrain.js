/*

    ADD BRAIN:
        - This component is a modal that allows the user to add a new brain.
        - The user can input a brain name, description, and upload files.
        - The user can upload multiple files at once.
            - The user can only upload files with the following extensions: JPEG, PNG, GIF, PPTX, PDF.
        - Then the user can submit the form to add the brain.
        - This is done via a POST request through formData to the server.

*/


import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import { FileUploader } from 'react-drag-drop-files';

export default function AddBrain(props) {

    const [brainName, setBrainName] = useState('');
    const [brainDescription, setBrainDescription] = useState('');

    const baseUrl = document.URL;


    const { brainId } = props;

    /* ========== START OF MODAL TOGGLE LOGIC ========== */

    const [show, setShow] = useState(props.show);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    /* ========== END OF MODAL TOGGLE LOGIC ========== */





    /* ========== START OF NEW FILE LOGIC ========== */
    const fileTypes = ["JPEG", "PNG", "GIF", "PPTX", "PDF"];
    const [files, setFiles] = useState([]);
    const handleChange = (newFiles) => {
        setFiles(prevFiles => [...prevFiles, ...newFiles]);
    };
    const handleDelete = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };
    // Permanent state for files to be displayed
    const [fileArray, setFileArray] = useState([]);
    // Effect to log fileArray whenever it changes
    useEffect(() => {
        console.log("Current files in the array:", files);
    }, [files]); // Dependency array includes fileArray

    /* ========== END OF NEW FILE LOGIC ========== */

    const [brainNameError, setBrainNameError] = useState('');
    const validateBrainName = () => {
        const regex = /^[a-zA-Z0-9 ]+$/; // Regex to allow only alphanumeric characters and spaces
        if (brainName.length < 3 && !regex.test(brainName)) {
            // Brain name is too short and contains special characters
            setBrainNameError("Brain name must be at least 3 characters long and cannot contain special characters: -`!@#$£%^&*()_-+={}[]|`:;'<,>.?/");
            return false;
        } else if (brainName.length < 3) {
            // Brain name is too short
            setBrainNameError("Brain name must be at least 3 characters long.");
            return false;
        } else if (!regex.test(brainName)) {
            // Brain name contains special characters
            setBrainNameError("Brain name cannot contain special characters: -`!@#$£%^&*()_-+={}[]|`:;'<,>.?/");
            return false;
        }
        setBrainNameError(""); // No error
        return true;
    };


    /* ========== START OF SUBMIT LOGIC ========== */

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate brain name before proceeding
        if (!validateBrainName()) {
            // Don't proceed with form submission if validation fails
            return;
        }

        let formData = new FormData();
        formData.append('name', brainName);
        formData.append('description', brainDescription);
        files.forEach((file) => {
            formData.append('files', file);
        });

        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        console.log(formData.getAll('files'));
        props.newBrain(formData);

        // reset state after submission
        setBrainName('');
        setBrainDescription('');
        setFiles([]);

    };

    /* ========== END OF SUBMIT LOGIC ========== */

    /* ========== START OF TESTS ========== */

    /* ========== END OF TESTS ========== */

    return (
        <>
            <div className="w-[250px] max-w-sm bg-gray-400 backdrop-filter backdrop-blur-lg bg-opacity-30 border-dashed border-2 border-gray-400 rounded-lg shadow-xl shadow-blue-gray-900/4 dark:bg-gray-800 dark:border-gray-700 m-2">
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
                size='l'
                show={props.show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Add Brain</Modal.Title>
                </Modal.Header>
                <Modal.Body className="max-h-[73vh] overflow-auto">

                    <form
                        id='edit-brain'
                        className="w-full max-w-lg"
                        onSubmit={handleSubmit}
                        enctype="multipart/form-data"
                    >
                        {/* Brain Name Input Field */}
                        <div className="mb-4">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="brain-name">
                                Brain Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="brain-name"
                                type="text"
                                value={brainName}
                                onChange={(e) => setBrainName(e.target.value)}
                                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                placeholder="Brain Name"
                                required
                            />
                            <div className="mt-1">
                                {brainNameError && <p className="text-red-500 text-xs italic mb-1">{brainNameError}</p>}
                            </div>
                            <div>
                                <p className="text-gray-600 text-xs italic">Name must be at least 3 characters long and cannot contain special characters: -`!@#$£%^&amp;*()_-+={}[]|`:;"'&lt;,&gt;.?/</p>
                            </div>
                        </div>

                        {/* Brain Description Input Field */}
                        <div className="mb-4">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="brain-description">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="brain-description"
                                value={brainDescription}
                                onChange={(e) => setBrainDescription(e.target.value)}
                                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                placeholder="Brain Description"
                                rows="2"
                                required
                            ></textarea>
                        </div>

                        {/* File Upload Section */}
                        <div className="mb-4">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                                Upload Files <span className="text-red-500">*</span>
                            </label>
                            <FileUploader
                                multiple={true}
                                handleChange={handleChange}
                                name="files"
                                types={fileTypes}
                                className="mb-2"
                            />
                        </div>

                        {/* Uploaded Files Display */}
                        <div>
                            <label className='block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2'>Uploaded Files</label>
                            <div className="max-h-48 overflow-y-auto border border-gray-300 p-4 rounded-lg space-y-2">
                                {files.length > 0 ? (
                                    files.map((file, index) => (
                                        <div key={index} className="flex justify-between items-center bg-white p-2 border rounded shadow-sm">
                                            <span className="text-sm">{file.name}</span>
                                            <button
                                                onClick={() => handleDelete(index)}
                                                className="text-white bg-red-500 px-3 py-1 rounded hover:bg-red-700 transition-colors duration-150 cursor-pointer"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No files uploaded yet.</p>
                                )}
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