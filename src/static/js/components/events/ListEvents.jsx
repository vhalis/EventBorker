import React from 'react';
import { Button, Grid, Input, Loader } from 'semantic-ui-react';

import { getCurApiUrl } from '../../api-utils.js';

import Event from './Event.jsx';


const API_ENDPOINT = 'events';

export default class EventList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            events: {},
            loading: false,
            searchByServiceId: '',
            searchByType: '',
            sortBy: '',
        };
        this.deleteEvent = this.deleteEvent.bind(this);
    }

    componentDidMount() {
        this.setState({loading: true});
        this.getInitialData();
    }

    getInitialData() {
        try {
            fetch(getCurApiUrl(API_ENDPOINT, 'getOrCreate')).then((result) => {
                result.json().then((jsonResponse) => {
                    this.setState((prevState) => {
                        var newEvents = prevState.events;
                        for (const eventId in jsonResponse) {
                            newEvents[eventId] = JSON.parse(
                                jsonResponse[eventId]);
                        }
                        
                        return {
                            events: newEvents,
                            loading: false,
                        };
                    });
                });
            });
        } catch (e) {
            /* eslint-disable no-console */
            console.log('Error fetching events', e);
            /* eslint-enable no-console */
            this.setState({loading: false});
        }
    }

    deleteEvent(eventId) {
        try {
            fetch(
                getCurApiUrl(API_ENDPOINT, 'byId', eventId),
                {method: 'delete'}
            ).then((result) => {
                if (result.status === 202) {
                    this.setState((prevState) => {
                        delete prevState.events[eventId];
                        return {events: prevState.events};
                    });
                }
            });
        } catch (e) {
            /* eslint-disable no-console */
            console.log(`Error deleting event ${eventId}`, e);
            /* eslint-enable no-console */
        }
    }

    setOrUnsetSortBy(sortField) {
        this.setState((prevState) => {
            if (prevState.sortBy === sortField) {
                sortField = '';
            }
            return {sortBy: sortField};
        });
    }

    render() {
        const {
            events,
            isLoading,
            searchByServiceId,
            searchByType,
            sortBy,
        } = this.state;
        var eventsToRender = [];
        for (const eventId in events) {
            const event = events[eventId];

            if (searchByServiceId &&
                    !event.serviceId.includes(searchByServiceId)) {
                continue;
            }
            if (searchByType &&
                    !event.type.includes(searchByType)) {
                continue;
            }
           
            eventsToRender.push(
                <Grid.Row
                    key={eventId}
                    data-serviceId={event.serviceId}
                    data-type={event.type}
                >
                    <Event
                        id={eventId}
                        onDelete={() => this.deleteEvent(eventId)}
                        {...event} />
                </Grid.Row>
            );
        }

        if (sortBy !== '') {
            eventsToRender.sort((a, b) => {
                return a.props['data-' + sortBy] > b.props['data-' + sortBy];
            });
        }

        if (isLoading) {
            eventsToRender.push(
                <Grid.Row key='loader'>
                    <Loader
                        active
                        key='loader'
                        inline='centered' />
                </Grid.Row>
            );
        }

        const gridHeader = (
            <Grid columns={4}>
                <Grid.Row>
                    <Grid.Column>
                        <Button
                            content='Service ID'
                            size='large'
                            primary={sortBy === 'serviceId'}
                            secondary={sortBy !== 'serviceId'}
                            onClick={() => this.setOrUnsetSortBy('serviceId')} />
                    </Grid.Column>
                    <Grid.Column>
                        <Button
                            content='Type'
                            size='large'
                            primary={sortBy === 'type'}
                            secondary={sortBy !== 'type'}
                            onClick={() => this.setOrUnsetSortBy('type')} />
                    </Grid.Column>
                    <Grid.Column>
                        <Button
                            content='Data'
                            disabled
                            secondary
                            size='big' />
                    </Grid.Column>
                    <Grid.Column></Grid.Column>
                </Grid.Row>
            </Grid>
        );

        const gridSearch = (
            <Grid columns={4}>
                <Grid.Row>
                    <Grid.Column>
                        <Input 
                            fluid 
                            placeholder='Search by Service ID'
                            value={searchByServiceId}
                            onChange={(event) => this.setState({
                                searchByServiceId: event.target.value})} />
                    </Grid.Column>
                    <Grid.Column>
                        <Input 
                            fluid 
                            placeholder='Search by Type'
                            value={searchByType}
                            onChange={(event) => this.setState({
                                searchByType: event.target.value})} />
                    </Grid.Column>
                    <Grid.Column>
                    </Grid.Column>
                    <Grid.Column>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        );

        return (
            <Grid>
                <Grid.Row>
                    {gridHeader}
                </Grid.Row>
                <Grid.Row>
                    {gridSearch}
                </Grid.Row>
                {eventsToRender}
            </Grid>
        );
    }
}
