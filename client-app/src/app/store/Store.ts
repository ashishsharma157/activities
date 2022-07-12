import { createContext, useContext } from "react";
import ActivityStore from "./ActivityStore";
import CommentStore from "./CommentStore";
import CommonStore from "./CommonStore";
import ModelStore from "./modelStore";
import ProfileStore from "./ProfileStore";
import UserStore from "./UserStore";

interface Store{
    activityStore:ActivityStore;
    commonStore:CommonStore;
    userStore:UserStore;
    modalStore:ModelStore;
    profileStore:ProfileStore;
    commentStore:CommentStore;
}

export const store:Store={
    activityStore:new ActivityStore(),
    commonStore:new CommonStore(),
    userStore:new UserStore(),
    modalStore:new ModelStore(),
    profileStore: new ProfileStore(),
    commentStore:new CommentStore()
}

export const StoreContext=createContext(store);

export function useStore(){
    return useContext(StoreContext);
}