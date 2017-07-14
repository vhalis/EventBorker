import React from 'react';
import PropTypes from 'prop-types';
import { Button, Grid, Input, Loader } from 'semantic-ui-react';
import socketIO from 'socket.io-client';

import { getApiNamespace, getApiUrl } from '../../api-utils.js';

import Event from './Event.jsx';


const API_VERSION = 'v1.0.0';
const API_ENDPOINT = 'events';
const getEventsApiUrl = getApiUrl.bind(window, API_VERSION, API_ENDPOINT);
const API_NAMESPACE = getApiNamespace(API_VERSION, API_ENDPOINT);

export default class EventList extends React.Component {

    constructor(props) {
        super(props);
        const { paginateByOptions } = this.props;
        this.state = {
            events: {},
            gotInitialData: false,
            loading: false,
            page: 0,
            paginateBy: (paginateByOptions.length > 0 ? paginateByOptions[0] : 1),
            searchByServiceId: '',
            searchByType: '',
            sortBy: '',
        };
    }

    componentDidMount() {
        this.setState({loading: true});
        this.setUpSockets();
    }

    // API Methods
    setUpSockets() {
        this._socket = socketIO(API_NAMESPACE);
        if (!this.state.gotInitialData) {
            this._socket.emit('loadall', true);
        }
        this._socket.on('connect_error', () => this.getInitialData());
        this._socket.on('create', (data) => this.eventCreatedRemote(data));
        this._socket.on('delete', (id) => this.eventDeletedRemote(id));
        // The response to loadall
        this._socket.on('alldata', (data) => this.receiveInitialData(data));
    }

    eventDeletedRemote(eventId) {
        this.setState((prevState) => {
            delete prevState.events[eventId];
            return {events: prevState.events};
        }); 
    }

    eventCreatedRemote({event, eventId}) {
        try {
            this.setState((prevState) => {
                prevState.events[eventId] = JSON.parse(event);
                return {events: prevState.events};
            });
        } catch (e) {
            /* eslint-disable no-console */
            console.log(`Error parsing created event ${eventId}: ${event}`, e);
            /* eslint-enable no-console */
        }
    }

    deleteEvent(eventId) {
        try {
            fetch(
                getEventsApiUrl('byId', eventId),
                {method: 'delete'}
            ).then((result) => {
                // Manual removal if socket is down
                if (!this._socket.connected && result.status == 200) {
                    this.setState((prevState) => {
                        delete prevState.events[eventId];
                        return {events: prevState.events};
                    });
                }
            });
        } catch (e) {
            // TODO: Notify the specific row that it could not delete
            /* eslint-disable no-console */
            console.log(`Error deleting event ${eventId}`, e);
            /* eslint-enable no-console */
        }
    }

    getInitialData() {
        if (this.state.gotInitialData) { return; }
        try {
            fetch(getEventsApiUrl('getOrCreate')).then((result) => {
                result.json().then((jsonResponse) => {
                    this.receiveInitialData(jsonResponse);
                });
            });
        } catch (e) {
            /* eslint-disable no-console */
            console.log('Error fetching events', e);
            /* eslint-enable no-console */
            this.setState({loading: false});
        }
    }

    receiveInitialData(data) {
        this.setState((prevState) => {
            var newEvents = prevState.events;
            for (const eventId in data) {
                newEvents[eventId] = JSON.parse(
                    data[eventId]);
            }
            
            return {
                events: newEvents,
                gotInitialData: true,
                loading: false,
            };
        });
    }
    // End API methods

    // Sort methods
    setOrUnsetSortBy(sortField) {
        this.setState((prevState) => {
            if (prevState.sortBy === sortField) {
                sortField = '';
            }
            return {sortBy: sortField};
        });
    }
    // End Sort methods

    // Render methods
    renderHeader(sortBy) {
        return (
            <Grid columns={4}>
                <Grid.Row>
                    <Grid.Column textAlign='center'>
                        <Button
                            content='Service ID'
                            size='large'
                            primary={sortBy === 'serviceId'}
                            secondary={sortBy !== 'serviceId'}
                            onClick={() => this.setOrUnsetSortBy('serviceId')} />
                    </Grid.Column>
                    <Grid.Column textAlign='center'>
                        <Button
                            content='Type'
                            size='large'
                            primary={sortBy === 'type'}
                            secondary={sortBy !== 'type'}
                            onClick={() => this.setOrUnsetSortBy('type')} />
                    </Grid.Column>
                    <Grid.Column textAlign='center'>
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
    }

    renderSearch(searchByServiceId, searchByType) {
        return (
            <Grid columns={4}>
                <Grid.Row>
                    <Grid.Column>
                        <Input 
                            fluid 
                            focus={searchByServiceId !== ''}
                            placeholder='Search by Service ID'
                            value={searchByServiceId}
                            onChange={(event) => this.setState({
                                searchByServiceId: event.target.value})} />
                    </Grid.Column>
                    <Grid.Column>
                        <Input 
                            fluid 
                            focus={searchByType !== ''}
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
    }

    renderPaginate(paginateBy, totalEvents, page) {
        const totalPages = (
            Math.floor(totalEvents / paginateBy) +
            ((totalEvents % paginateBy) > 0 ? 1 : 0)
        );

        // Ensure consistency of page: if events get removed from list, either
        // by search or by deletion from this or other clients
        if (page >= totalPages - 1) {
            page = totalPages - 1;
        }

        const pageTabs = (
            <Button.Group>
                <Button
                    content='<<'
                    disabled={page <= 0}
                    onClick={() => this.setState({page: 0})} />
                <Button
                    content='<'
                    disabled={page <= 0}
                    onClick={() => this.setState({page: page - 1})} />
                <Button disabled content={page + 1} />
                <Button
                    content='>'
                    disabled={page >= totalPages - 1}
                    onClick={() => this.setState({page: page + 1})} />
                <Button
                    content='>>'
                    disabled={page >= totalPages - 1}
                    onClick={() => this.setState({page: totalPages - 1})} />
            </Button.Group>
        );

        const changePaginate = (paginateSelection) => {
            this.setState((prevState) => {
                if (paginateSelection !== prevState.paginateBy) {
                    return {paginateBy: paginateSelection, page: 0};
                }
            });
        };

        const paginateOptions = (
            <Button.Group>
                <Button disabled content='# Per Page' />
                {this.props.paginateByOptions.map((num) =>
                    <Button
                        key={num}
                        content={num}
                        primary={paginateBy === num}
                        secondary={paginateBy !== num}
                        onClick={() => changePaginate(num)} />
                )}
            </Button.Group>
        );

        return (
            <Grid columns={3}>
                <Grid.Column>
                    <Button disabled content={`${totalPages} pages`} />
                </Grid.Column>
                <Grid.Column>
                    {pageTabs}
                </Grid.Column>
                <Grid.Column textAlign='right'>
                    {paginateOptions}
                </Grid.Column>
            </Grid>
        );
    }

    render() {
        const {
            events,
            isLoading,
            page,
            paginateBy,
            searchByServiceId,
            searchByType,
            sortBy,
        } = this.state;
        let eventsToRender = [];
        const startPaginationIdx = page * paginateBy,
            endPaginationIdx = startPaginationIdx + paginateBy;

        for (const eventId in events) {
            const event = events[eventId];

            // Exclude by search
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

        const loader = (
            <Grid.Row key='loader'>
                <Loader
                    active
                    key='loader'
                    inline='centered' />
            </Grid.Row>
        );

        return (
            <Grid>
                <Grid.Row>
                    {this.renderHeader(sortBy)}
                </Grid.Row>
                <Grid.Row>
                    {this.renderSearch(searchByServiceId, searchByType)}
                </Grid.Row>
                <Grid.Row>
                    {this.renderPaginate(paginateBy, eventsToRender.length, page)}
                </Grid.Row>
                {eventsToRender.slice(startPaginationIdx, endPaginationIdx)}
                {isLoading && loader}
            </Grid>
        );
    }
    // End Render methods
}

EventList.propTypes = {
    paginateByOptions: PropTypes.arrayOf(PropTypes.number),
};

EventList.defaultProps = {
    paginateByOptions: [5, 10],
};
