import React from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import HomePage from "../../features/home/HomePage";

export default function HomeRoute(){
    return(
        <Outlet/>
    )
}