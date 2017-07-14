import React from 'react';
import PropTypes from 'prop-types';

import { Button, Grid } from 'semantic-ui-react';


class Event extends React.Component {
    render() {
        const { id, type, serviceId, data, onDelete } = this.props;
        const deleteButton = (
            <Button
                content='Delete'
                size='mini'
                onClick={onDelete} />
        );
        return (
            <Grid key={id} columns={4}>
                <Grid.Row>
                    <Grid.Column><p>{serviceId}</p></Grid.Column>
                    <Grid.Column><p>{type}</p></Grid.Column>
                    <Grid.Column><p>{data}</p></Grid.Column>
                    <Grid.Column textAlign='right'>{deleteButton}</Grid.Column>
                </Grid.Row>
            </Grid>
        );
    }
}

Event.propTypes = {
    onDelete: PropTypes.func.isRequired,

    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    serviceId: PropTypes.string.isRequired,
    data: PropTypes.string.isRequired,
};

export default Event;
