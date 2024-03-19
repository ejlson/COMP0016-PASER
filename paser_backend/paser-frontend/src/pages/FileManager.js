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

  function handleBrainUpdate(updatedBrain) {
    setBrains(brains.map(brain => {
      if (brain.id === updatedBrain.id) {
        return updatedBrain; // Replace with the updated brain
      }
      return brain; // Unchanged brains
    }));
  }

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

  // function newBrain(brainName, brainDescription, brainFiles) {
  //   const data = {
  //       name: brainName,
  //       description: brainDescription,
  //       files: brainFiles
  //   };
  //   const url = baseUrl + '/api/brains/';
  //   fetch(url, {
  //       method: 'POST',
  //       headers: {
  //           'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(data)
  //   }).then((response) => {
  //       if(!response.ok) {
  //           throw new Error('Network response was not ok');
  //       }
  //       return response.json();
  //   }).then((data) => {
  //       toggleShow();
  //       console.log(data);
  //       setBrains([...brains, data.brain]);
  //       console.log('brain added');
  //       // make sure list is updated appropriately
  //   }).catch((e) =>   {
  //       console.log(e);
  //   });
  // }

  function newBrain(formData) {
    const url = baseUrl + `/api/brains/`;
    fetch(url, {
      method: 'POST',
      body: formData // Directly use FormData here
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }).then((data) => {
      toggleShow();
      console.log(data);
      setBrains([...brains, data.brain]);
      console.log('brain added');
    }).catch((e) => {
      console.log(e);
    });
  }

  return (
    <>

      <div className='flex flex-wrap flex-start justify-start'>

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