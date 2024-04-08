import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

/* import components */

export default function Brain(props) {

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

    return (
        <>
            <div className="w-[250px] max-w-sm bg-gray-400 backdrop-filter backdrop-blur-lg bg-opacity-30 text-white border border-gray-200 rounded-lg shadow-xl shadow-blue-gray-900/4 dark:bg-gray-800 dark:border-gray-700 m-2">
                <div className="flex flex-col items-center pb-4 px-4 pt-4">
                    <div className="w-20 h-20 mb-3 rounded-full shadow-xl shadow-blue-gray-900/4 bg-gradient-to-r from-cyan-500 to-blue-500" />
                    <h5 className="mb-1 text-xl font-medium text-gray-500 dark:text-white">
                        {props.name}
                    </h5>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {props.description ? props.description : 'No description available.'}
                    </span>
                    <div className="flex mt-4 md:mt-6">
                        {props.editBrain}
                        <button
                            className="py-2 px-4 ms-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                            onClick={(e) => {
                                console.log('deleting brain with id: ' + props.id);
                                const url = '/brains/' + props.id;                               
                                const csrfToken = getCookie('csrftoken');
                                fetch(url, {
                                    method: 'DELETE',
                                    headers: {
                                        'X-CSRFToken': csrfToken,
                                    },
                                })
                                    .then((response) => {
                                        if (!response.ok) {
                                            throw new Error('Network response was not ok');
                                        }
                                        console.log('deleted brain with id: ' + props.id);
                                        console.log('updating page via refresh...');
                                        window.location.reload();
                                    })
                                    .catch((e) => {
                                        console.log(e);
                                        console.log('failed to delete brain with id: ' + props.id);
                                    });
                            }}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}