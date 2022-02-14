import { observer } from "mobx-react-lite";
import React from "react";
import { Button, Container, Menu } from "semantic-ui-react";
import { useStore } from "../store/Store";

export default observer( function NavBar(){
    const {activityStore} =useStore();
    return(        
    <Menu inverted fixed='top'>
        <Container>
            <Menu.Item header>
                <img src="/assets/logo.png" alt="logo" style={{marginRight:10}}/>
                Reactivity
            </Menu.Item>
            <Menu.Item name='Activities'/>
            <Menu.Item>
                <Button onClick={()=>activityStore.openForm()} positive content='Create Activity'/>
            </Menu.Item>
        </Container>
        </Menu>
    );
})