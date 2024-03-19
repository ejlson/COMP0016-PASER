import React from "react";

/* import components */

import {
    Card,
    Typography,
    List,
    ListItem,
    ListItemSuffix,
    Chip
} from "@material-tailwind/react";

/* import icons */

export default function Sidebar() {

    return (
        <>
            <Card className="h-[calc(100vh-3.5rem)] max-w-[21rem] p-4 shadow-xl shadow-blue-gray-900/4 z-0">
                <div className="mb-1 flex items-center gap-16 px-4">
                    <Typography variant="h5" color="blue-gray">
                        Paser
                    </Typography>
                </div>
                <hr className="my-2 border-blue-gray-50" />
                <List>
                    <ListItem>
                        Chat 1
                        <ListItemSuffix>
                            <Chip value="dd/mm/yyyy" size="sm" variant="ghost" color="blue-gray" className="rounded-full" />
                        </ListItemSuffix>
                    </ListItem>
                    <ListItem>
                        Chat 2
                        <ListItemSuffix>
                            <Chip value="dd/mm/yyyy" size="sm" variant="ghost" color="blue-gray" className="rounded-full" />
                        </ListItemSuffix>
                    </ListItem>
                    <ListItem>
                        Chat 3
                        <ListItemSuffix>
                            <Chip value="dd/mm/yyyy" size="sm" variant="ghost" color="blue-gray" className="rounded-full" />
                        </ListItemSuffix>
                    </ListItem>
                </List>
            </Card>
        </>
    );
}