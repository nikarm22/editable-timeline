import { Dispatch, FC, ReactNode, SetStateAction, createContext, useContext, useState } from "react";

interface IEditContext {
    currentEditId: string | number | null;
    setCurrentEditId: Dispatch<SetStateAction<string | number | null>>;
}

const EditContext = createContext<IEditContext>({ currentEditId: null, setCurrentEditId: () => null });

export default EditContext;

export const EditProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [currentEditId, setCurrentEditId] = useState<string | number | null>(null);
    return <EditContext.Provider value={{
        currentEditId,
        setCurrentEditId,
    }}>
        {children}
    </EditContext.Provider>
};

export const useEdit = () => useContext(EditContext);

