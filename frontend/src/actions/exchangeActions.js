import axios from 'axios';
import {
    CREATE_EXCHANGE_REQUEST,
    CREATE_EXCHANGE_SUCCESS,
    CREATE_EXCHANGE_FAIL,
    MY_EXCHANGES_REQUEST,
    MY_EXCHANGES_SUCCESS,
    MY_EXCHANGES_FAIL,
    ALL_EXCHANGES_REQUEST,
    ALL_EXCHANGES_SUCCESS,
    ALL_EXCHANGES_FAIL,
    UPDATE_EXCHANGE_REQUEST,
    UPDATE_EXCHANGE_SUCCESS,
    UPDATE_EXCHANGE_FAIL,
    DELETE_EXCHANGE_REQUEST,
    DELETE_EXCHANGE_SUCCESS,
    DELETE_EXCHANGE_FAIL,
    CLEAR_ERRORS
} from '../constants/exchangeConstants';

// Create new exchange request
export const createExchangeRequest = (exchangeData) => async (dispatch) => {
    try {
        dispatch({ type: CREATE_EXCHANGE_REQUEST });

        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const { data } = await axios.post('/api/v1/exchange/new', exchangeData, config);

        dispatch({
            type: CREATE_EXCHANGE_SUCCESS,
            payload: data.exchange
        });
    } catch (error) {
        dispatch({
            type: CREATE_EXCHANGE_FAIL,
            payload: error.response.data.message
        });
    }
};

// Get currently logged in user's exchanges
export const getMyExchanges = () => async (dispatch) => {
    try {
        dispatch({ type: MY_EXCHANGES_REQUEST });

        const { data } = await axios.get('/api/v1/exchanges/me');

        dispatch({
            type: MY_EXCHANGES_SUCCESS,
            payload: data.exchanges
        });
    } catch (error) {
        dispatch({
            type: MY_EXCHANGES_FAIL,
            payload: error.response.data.message
        });
    }
};

// Get all exchanges (Admin)
export const getAllExchanges = () => async (dispatch) => {
    try {
        dispatch({ type: ALL_EXCHANGES_REQUEST });

        const config = {
            withCredentials: true
        };

        const { data } = await axios.get('/api/v1/admin/exchanges', config);

        if (!data || !data.exchanges) {
            throw new Error('Invalid response format from server');
        }

        // Ensure each exchange has the required fields
        const formattedExchanges = data.exchanges.map(exchange => ({
            ...exchange,
            user: exchange.user || {},
            desiredProduct: exchange.desiredProduct || {},
            exchangeProduct: exchange.exchangeProduct || {},
            status: exchange.status || 'Unknown'
        }));

        dispatch({
            type: ALL_EXCHANGES_SUCCESS,
            payload: formattedExchanges
        });
    } catch (error) {
        console.error('Error fetching exchanges:', error);
        dispatch({
            type: ALL_EXCHANGES_FAIL,
            payload: error.response?.data?.message || error.message || 'Failed to fetch exchanges'
        });
    }
};

// Update exchange status (Admin)
export const updateExchange = (id, status) => async (dispatch) => {
    try {
        dispatch({ type: UPDATE_EXCHANGE_REQUEST });

        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const { data } = await axios.put(`/api/v1/admin/exchange/${id}`, { status }, config);

        dispatch({
            type: UPDATE_EXCHANGE_SUCCESS,
            payload: data.success
        });
    } catch (error) {
        dispatch({
            type: UPDATE_EXCHANGE_FAIL,
            payload: error.response.data.message
        });
    }
};

// Delete exchange request
export const deleteExchange = (id) => async (dispatch) => {
    try {
        dispatch({ type: DELETE_EXCHANGE_REQUEST });

        const { data } = await axios.delete(`/api/v1/exchange/${id}`);

        dispatch({
            type: DELETE_EXCHANGE_SUCCESS,
            payload: data.success
        });
    } catch (error) {
        dispatch({
            type: DELETE_EXCHANGE_FAIL,
            payload: error.response.data.message
        });
    }
};

// Clear Errors
export const clearErrors = () => async (dispatch) => {
    dispatch({
        type: CLEAR_ERRORS
    });
}; 