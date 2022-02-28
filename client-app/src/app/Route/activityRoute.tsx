import React from "react";
import { Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Container } from "semantic-ui-react";
import ActivityDashboard from "../../features/activities/dashboard/ActivityDashboard";
import ActivityDetails from "../../features/activities/details/ActivityDetails";
import ActivityForm from "../../features/activities/form/ActivityForm";
import Navbar from "../layout/navbar";


export default function ActivityRoute(){
    const location=useLocation();
    return(
        <>
        <Navbar/>
        <Outlet/>
        </>
    )
}