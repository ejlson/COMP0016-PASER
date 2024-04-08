import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

/* import components */
import Brain from '../components/Brain';
import AddBrain from '../components/AddBrain';
import EditBrain from '../components/EditBrain';

function FileManager() {
  const { id } = useParams();
  const [files, setFiles] = useState([]);
  useEffect(() => {
    fetch(`http://localhost:8000/api/brains/`)
      .then(response => response.json())
      .then(data => setFiles(data));
  }, [])

  const baseUrl = 'http://localhost:8000';

  function handleDeleteBrain(deletedBrainId) {
    setBrains(brains.filter(brain => brain.id !== deletedBrainId));
  }

  // function handleBrainUpdate(updatedBrain) {
  //   setBrains(brains.map(brain => {
  //     if (brain.id === updatedBrain.id) {
  //       return updatedBrain; // Replace with the updated brain
  //     }
  //     return brain; // Unchanged brains
  //   }));
  // }

  const handleBrainUpdate = (updatedBrain) => {
    setBrains(brains.map(brain => brain.id === updatedBrain.id ? updatedBrain : brain));
  };

  function updateBrain(id, newBrainName, newBrainDescription, newBrainFiles) {

    // implement files later
    const updateBrains = brains.map((brain) => {
      if (id === brain.id) {
        return {
          ...brain,
          name: newBrainName,
          description: newBrainDescription,
          file: newBrainFiles
        }
      }
      return brain;
    });
    setBrains(updateBrains);

    // Prepare data for API call
    const formData = new FormData();
    formData.append('name', newBrainName);
    formData.append('description', newBrainDescription);
    newBrainFiles.forEach(file => formData.append('files', file));

    // API call to update brain on server
    axios({
      method: 'patch',
      url: `http://localhost:8000/brains/${id}/`,
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
      .then(response => {
        // Handle successful update
        console.log('Brain updated successfully:', response.data);
      })
      .catch(error => {
        // Handle error
        console.error('Error updating brain:', error);
      });
  }


  const [brains, setBrains] = useState();
  const [show, setShow] = useState(false);

  function toggleShow() {
    setShow(!show);
  }

  useEffect(() => {
    console.log('fetching...')
    fetch('http://localhost:8000/api/brains/')
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setBrains(data.brains);
      })
  }, []);

  const [brain, setBrain] = useState();

  // function newBrain(formData) {
  //   const url = baseUrl + `/api/brains/create/`;
  //   fetch(url, {
  //     method: 'POST',
  //     body: formData,
  //   }).then((response) => {
  //     if (!response.ok) {
  //       throw new Error('Network response was not ok');
  //     }
  //     return response.json();
  //   }).then((data) => {
  //     toggleShow();
  //     console.log(data);
  //     setBrains([...brains, data.brain]);
  //     console.log('brain added');
  //   }).catch((e) => {
  //     console.log(e);
  //   });
  // }

  function newBrain(formData) {
    const url = `${baseUrl}/api/brains/create/`; // Ensure the URL is correctly concatenated
    fetch(url, {
      method: 'POST',
      body: formData,
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }).then((data) => {
      setShow(false); // Close the modal
      // Fetch the updated list of brains to reflect the newly added brain
      fetchBrains(); // Fetch the updated brains list
    }).catch((e) => {
      console.error(e);
    });
  }

  // Fetch brains from the backend and update state
  function fetchBrains() {
    fetch(`${baseUrl}/api/brains/`)
      .then(response => response.json())
      .then(data => {
        setBrains(data.brains); // Assuming your backend returns an object with a 'brains' property
        console.log('Brains fetched successfully:', data.brains);
      })
      .catch(error => {
        console.error('Error fetching brains:', error);
      });
  }

  // Add fetchBrains to useEffect to initially load brains
  useEffect(() => {
    console.log('Fetching brains...');
    fetchBrains(); // Call fetchBrains to load brains when the component mounts
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <>

      <div className='flex flex-wrap flex-start justify-start overflow-hidden'>

        <AddBrain newBrain={newBrain} show={show} toggleShow={toggleShow} />

        {brains ? brains.map((brain) => {

          const editBrain = <EditBrain
            id={brain.id}
            name={brain.name}
            description={brain.description}
            files={brain.files}
            updateBrain={updateBrain}
            onUpdateBrain={handleBrainUpdate}
          />

          return (
            <>
              <Brain
                key={brain.id}
                id={brain.id}
                name={brain.name}
                description={brain.description}
                files={brain.files}
                alt='Brain icon'
                editBrain={editBrain}
                onDeleteBrain={() => handleDeleteBrain(brain.id)}
              />
            </>
          );
        }) : null}

      </div>

    </>
  );
}

export default FileManager;