import { createContext, useContext } from "react";
import ActivityStore from "./ActivityStore";
import CommonStore from "./CommonStore";
import ModelStore from "./modelStore";
import UserStore from "./UserStore";

interface Store{
    activityStore:ActivityStore;
    commonStore:CommonStore;
    userStore:UserStore;
    modalStore:ModelStore;
}

export const store:Store={
    activityStore:new ActivityStore(),
    commonStore:new CommonStore(),
    userStore:new UserStore(),
    modalStore:new ModelStore()
}

export const StoreContext=createContext(store);

export function useStore(){
    return useContext(StoreContext);
}