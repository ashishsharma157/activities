import { observer } from "mobx-react-lite";
import React from "react";
import { NavLink } from "react-router-dom";
import { Button, Container, Menu } from "semantic-ui-react";

export default observer( function NavBar(){

    return(        
    <Menu inverted fixed='top'>
        <Container>
            <Menu.Item as={NavLink} to='/' header>
                <img src="/assets/logo.png" alt="logo" style={{marginRight:10}}/>
                Reactivity
            </Menu.Item>
            <Menu.Item as={NavLink} to='/activities' name='Activities'/>
            <Menu.Item>
                <Button as={NavLink} to='/createactivity' positive content='Create Activity'/>
            </Menu.Item>
        </Container>
        </Menu>
    );
})