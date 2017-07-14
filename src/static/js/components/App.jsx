import React from 'react';
import 'semantic-ui-css/semantic.min.css';

import EventList from './events/ListEvents.jsx';

export default class App extends React.Component {
    render() {
        return (
            <EventList />
        );
    }
}
