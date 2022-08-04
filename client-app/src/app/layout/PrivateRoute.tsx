import React from "react";
import { Navigate } from "react-router-dom";
import { useStore } from "../store/Store";

interface Props{
    children:any;
}
export default function PrivateRoute({children}:Props){
    const {userStore:{isLoggedIn}}=useStore();
    return isLoggedIn ? children : <Navigate replace to='/'/>;
        
}