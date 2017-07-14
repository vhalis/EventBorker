import React from 'react';
import { Button, Grid, Input, Loader, Menu } from 'semantic-ui-react';

import { getCurApiUrl } from '../../api-utils.js';

import Event from './Event.jsx';


const API_ENDPOINT = 'events';

export default class EventList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            events: {},
            loading: false,
            page: 0,
            paginateBy: 0,
            searchByServiceId: '',
            searchByType: '',
            sortBy: '',
        };
    }

    componentDidMount() {
        this.setState({loading: true});
        this.getInitialData();
    }

    // API Methods
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
                    <Grid.Column textAlign='middle'>
                        <Button
                            content='Service ID'
                            size='large'
                            primary={sortBy === 'serviceId'}
                            secondary={sortBy !== 'serviceId'}
                            onClick={() => this.setOrUnsetSortBy('serviceId')} />
                    </Grid.Column>
                    <Grid.Column textAlign='middle'>
                        <Button
                            content='Type'
                            size='large'
                            primary={sortBy === 'type'}
                            secondary={sortBy !== 'type'}
                            onClick={() => this.setOrUnsetSortBy('type')} />
                    </Grid.Column>
                    <Grid.Column textAlign='middle'>
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
        // There's a cross interaction between search and pagination
        // so put page=0 when search value changes
        return (
            <Grid columns={4}>
                <Grid.Row>
                    <Grid.Column>
                        <Input 
                            fluid 
                            placeholder='Search by Service ID'
                            value={searchByServiceId}
                            onChange={(event) => this.setState({
                                searchByServiceId: event.target.value,
                                page: 0})} />
                    </Grid.Column>
                    <Grid.Column>
                        <Input 
                            fluid 
                            placeholder='Search by Type'
                            value={searchByType}
                            onChange={(event) => this.setState({
                                searchByType: event.target.value,
                                page: 0})} />
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
            (totalEvents / paginateBy) +
            ((totalEvents % paginateBy) > 0 ? 1 : 0)
        );

        const pageTabs = (
            <Button.Group>
                <Button
                    content='<<'
                    disabled={page <= 0}
                    onClick={() => this.setState({page: 0})} />
                <Button
                    content='<'
                    disabled={page <= 0}
                    onClick={() => this.setState({page: page-1})} />
                <Button disabled={true} content={page} />
                <Button
                    content='>'
                    disabled={page >= totalPages}
                    onClick={() => this.setState({page: page+1})} />
                <Button
                    content='>>'
                    disabled={page >= totalPages}
                    onClick={() => this.setState({page: totalPages})} />
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
                <Button
                    content='1'
                    primary={paginateBy === 1}
                    secondary={paginateBy !== 1}
                    onClick={() => changePaginate(1)} />
                <Button
                    content='2'
                    primary={paginateBy === 2}
                    secondary={paginateBy !== 2}
                    onClick={() => changePaginate(2)} />
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
                {eventsToRender}
                {isLoading && loader}
            </Grid>
        );
    }
    // End Render methods
}
