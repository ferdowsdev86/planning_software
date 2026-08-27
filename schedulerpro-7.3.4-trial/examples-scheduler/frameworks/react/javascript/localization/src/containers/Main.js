/**
 * Main component
 */
// libraries
import React, { Fragment } from 'react';

// our stuff
import Header from '../components/Header.js';
import Content from './Content.js';

const main = () => {

    return (
        <Fragment>
            <Header/>
            <Content/>
        </Fragment>
    );
};

export default main;
