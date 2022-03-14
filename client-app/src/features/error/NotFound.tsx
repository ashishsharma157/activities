import React from "react";
import { Link } from "react-router-dom";
import { Button, Header, Icon, Segment } from "semantic-ui-react";

export default function NotFound()
{
    return(
        <Segment placeholder>
            <Header icon>
                <Icon name='search'/>
                OOps not found
            </Header>
            <Segment.Inline>
                <Button as={Link} to='/activities' primary>Go to Activities</Button>
            </Segment.Inline>
        </Segment>
    )
}