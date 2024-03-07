import React, { Fragment } from 'react'
import { Disclosure } from '@headlessui/react'
import { NavLink } from 'react-router-dom'


const navigation = [
    { name: 'Chatbot', href: '/'},
    { name: 'Files', href: '/filemanager'}
]

export default function Navbar(props) {
    return (
        <>
            <Disclosure as="nav" className="">
                {({ open }) => (
                    <>
                        <div className="mx-auto px-1 sm:px-4 lg:px-4">
                            <div className="relative flex h-15 items-center justify-between">
                                <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-end">
                                    <div className="sm:block">
                                        <div className="flex space-x-4">
                                            {navigation.map((item) => (
                                                <NavLink
                                                    key={item.name}
                                                    to={item.href}
                                                    className={({isActive}) => {
                                                        console.log(item.href + ' ' + isActive)
                                                        return 'rounded-md px-2 py-2 text-sm font-medium text-decoration-none ' + 
                                                            (isActive 
                                                                ? ' bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow shadow-blue-gray-900/1'
                                                                : ' text-gray-900 hover:bg-gray-400 hover:text-white shadow shadow-blue-gray-900/1'
                                                            );
                                                    }}
            
                                                >
                                                    {item.name}
                                                </NavLink>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">

                                </div>
                            </div>
                        </div>
                    </>
                )}
            </Disclosure>
            {props.children}
        </>
    )
}
