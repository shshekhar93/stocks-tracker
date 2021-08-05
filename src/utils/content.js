import React, { useContext } from "react";

const ContentContext = React.createContext({});

function useContent() {
    const content = useContext(ContentContext);
    return (key) => (
        content[key] || `☃${key}☃`
    );
}

export {
    ContentContext,
    useContent
}