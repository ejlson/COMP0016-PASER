import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

/* import components */
import Brain from '../components/Brain';
import AddBrain from '../components/AddBrain';
import EditBrain from '../components/EditBrain';

function FileManager() {

  const [files, setFiles] = useState([]);
  useEffect(() => {
    fetch(`http://localhost:8000/api/brains/`)
      .then(response => response.json())
      .then(data => setFiles(data));
  }, [])

  const baseUrl = 'http://localhost:8000';

  function updateBrain(id, newBrainName, newBrainDescription) {

    // implement files later
    const updateBrains = brains.map((brain) => {
      if (id === brain.id) {
        return {
          ...brain,
          name: newBrainName,
          description: newBrainDescription
        }
      }
      return brain;
    });
    setBrains(updateBrains);
  }

  /*
  function newBrain(brainName, brainDescription) {
    newBrain= {
      id: uuidv4(),
      name: brainName,
      description: brainDescription
    }
    setBrains([...brains, newBrain])
  }
  */

  /*
  const [brainName, setBrainName] = useState('');
  const [brainDescription, setBrainDescription] = useState('');
  const [files, setFiles] = useState([]); 
  */

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

  const { id } = useParams();
  const [brain, setBrain] = useState();

  useEffect(() => {
    console.log('useEffect');
    const url = 'http://localhost:8000/api/brains/' + id;
    fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setBrain(data.brain);
      });
  }, []);

  function newBrain(brainName, brainDescription, brainFiles) {
    const data = {
        name: brainName,
        description: brainDescription,
        files: brainFiles
    };
    const url = baseUrl + '/api/brains/';
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    }).then((response) => {
        if(!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }).then((data) => {
        toggleShow();
        console.log(data);
        setBrains([...brains, data.brain]);
        // make sure list is updated appropriately
    }).catch((e) =>   {
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
              />
            </>
          );
          }) : null}

      </div>

    </>
  );
}

export default FileManager;