import React, { Fragment, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MDBDataTable } from 'mdbreact';
import MetaData from '../layout/MetaData';
import Loader from '../layout/Loader';
import Sidebar from './Sidebar';
import { useAlert } from 'react-alert';
import { useDispatch, useSelector } from 'react-redux';
import { getAllExchanges, updateExchange, clearErrors } from '../../actions/exchangeActions';
import { UPDATE_EXCHANGE_RESET } from '../../constants/exchangeConstants';

const ExchangeList = () => {
    const alert = useAlert();
    const dispatch = useDispatch();

    const { loading, error, exchanges } = useSelector(state => state.exchanges);
    const { error: updateError, isUpdated } = useSelector(state => state.exchangeUpdate);

    useEffect(() => {
        console.log('Fetching exchanges...');
        dispatch(getAllExchanges());

        if (error) {
            console.error('Exchange error:', error);
            alert.error(error);
            dispatch(clearErrors());
        }

        if (updateError) {
            console.error('Update error:', updateError);
            alert.error(updateError);
            dispatch(clearErrors());
        }

        if (isUpdated) {
            alert.success('Exchange status updated successfully');
            dispatch({ type: UPDATE_EXCHANGE_RESET });
        }

    }, [dispatch, alert, error, updateError, isUpdated]);

    const updateExchangeStatus = (id, status) => {
        dispatch(updateExchange(id, status));
    };

    const setExchanges = () => {
        console.log('Current exchanges:', exchanges);
        const data = {
            columns: [
                {
                    label: 'Exchange ID',
                    field: 'id',
                    sort: 'asc'
                },
                {
                    label: 'User',
                    field: 'user',
                    sort: 'asc'
                },
                {
                    label: 'Desired Product',
                    field: 'desiredProduct',
                    sort: 'asc'
                },
                {
                    label: 'Exchange Product',
                    field: 'exchangeProduct',
                    sort: 'asc'
                },
                {
                    label: 'Status',
                    field: 'status',
                    sort: 'asc'
                },
                {
                    label: 'Actions',
                    field: 'actions',
                }
            ],
            rows: []
        };

        if (!exchanges || !Array.isArray(exchanges)) {
            console.warn('Exchanges data is not available or invalid');
            return data;
        }

        exchanges.forEach(exchange => {
            if (!exchange) {
                console.warn('Skipping null exchange');
                return;
            }

            const user = exchange.user || {};
            const desiredProduct = exchange.desiredProduct || {};
            const exchangeProduct = exchange.exchangeProduct || {};

            data.rows.push({
                id: exchange._id || 'N/A',
                user: user.name || 'Unknown User',
                desiredProduct: desiredProduct.name || 'Unknown Product',
                exchangeProduct: exchangeProduct.name || 'Unknown Product',
                status: exchange.status || 'Unknown',
                actions: <Fragment>
                    <div className="dropdown">
                        <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Update Status
                        </button>
                        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                            <button 
                                className="dropdown-item" 
                                onClick={() => updateExchangeStatus(exchange._id, 'Pending')}
                            >
                                Pending
                            </button>
                            <button 
                                className="dropdown-item" 
                                onClick={() => updateExchangeStatus(exchange._id, 'Approved')}
                            >
                                Approved
                            </button>
                            <button 
                                className="dropdown-item" 
                                onClick={() => updateExchangeStatus(exchange._id, 'Rejected')}
                            >
                                Rejected
                            </button>
                        </div>
                    </div>
                </Fragment>
            });
        });

        return data;
    };

    return (
        <Fragment>
            <MetaData title={'All Exchange Requests'} />
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>

                <div className="col-12 col-md-10">
                    <Fragment>
                        <h1 className="my-5">All Exchange Requests</h1>

                        {loading ? <Loader /> : (
                            <MDBDataTable
                                data={setExchanges()}
                                className="px-3"
                                bordered
                                striped
                                hover
                            />
                        )}
                    </Fragment>
                </div>
            </div>
        </Fragment>
    );
};

export default ExchangeList; 