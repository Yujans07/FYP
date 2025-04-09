import {
    CREATE_EXCHANGE_REQUEST,
    CREATE_EXCHANGE_SUCCESS,
    CREATE_EXCHANGE_FAIL,
    CREATE_EXCHANGE_RESET,
    MY_EXCHANGES_REQUEST,
    MY_EXCHANGES_SUCCESS,
    MY_EXCHANGES_FAIL,
    ALL_EXCHANGES_REQUEST,
    ALL_EXCHANGES_SUCCESS,
    ALL_EXCHANGES_FAIL,
    UPDATE_EXCHANGE_REQUEST,
    UPDATE_EXCHANGE_SUCCESS,
    UPDATE_EXCHANGE_FAIL,
    UPDATE_EXCHANGE_RESET,
    DELETE_EXCHANGE_REQUEST,
    DELETE_EXCHANGE_SUCCESS,
    DELETE_EXCHANGE_FAIL,
    DELETE_EXCHANGE_RESET,
    CLEAR_ERRORS
} from '../constants/exchangeConstants';

export const newExchangeReducer = (state = {}, action) => {
    switch (action.type) {
        case CREATE_EXCHANGE_REQUEST:
            return {
                ...state,
                loading: true
            };

        case CREATE_EXCHANGE_SUCCESS:
            return {
                loading: false,
                success: true,
                exchange: action.payload
            };

        case CREATE_EXCHANGE_FAIL:
            return {
                loading: false,
                error: action.payload
            };

        case CREATE_EXCHANGE_RESET:
            return {
                ...state,
                success: false
            };

        case CLEAR_ERRORS:
            return {
                ...state,
                error: null
            };

        default:
            return state;
    }
};

export const myExchangesReducer = (state = { exchanges: [] }, action) => {
    switch (action.type) {
        case MY_EXCHANGES_REQUEST:
            return {
                loading: true
            };

        case MY_EXCHANGES_SUCCESS:
            return {
                loading: false,
                exchanges: action.payload
            };

        case MY_EXCHANGES_FAIL:
            return {
                loading: false,
                error: action.payload
            };

        case CLEAR_ERRORS:
            return {
                ...state,
                error: null
            };

        default:
            return state;
    }
};

export const exchangesReducer = (state = { exchanges: [] }, action) => {
    switch (action.type) {
        case ALL_EXCHANGES_REQUEST:
            return {
                loading: true
            };

        case ALL_EXCHANGES_SUCCESS:
            return {
                loading: false,
                exchanges: action.payload
            };

        case ALL_EXCHANGES_FAIL:
            return {
                loading: false,
                error: action.payload
            };

        case CLEAR_ERRORS:
            return {
                ...state,
                error: null
            };

        default:
            return state;
    }
};

export const exchangeReducer = (state = {}, action) => {
    switch (action.type) {
        case UPDATE_EXCHANGE_REQUEST:
        case DELETE_EXCHANGE_REQUEST:
            return {
                ...state,
                loading: true
            };

        case UPDATE_EXCHANGE_SUCCESS:
            return {
                ...state,
                loading: false,
                isUpdated: true
            };

        case DELETE_EXCHANGE_SUCCESS:
            return {
                ...state,
                loading: false,
                isDeleted: true
            };

        case UPDATE_EXCHANGE_FAIL:
        case DELETE_EXCHANGE_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload
            };

        case UPDATE_EXCHANGE_RESET:
            return {
                ...state,
                isUpdated: false
            };

        case DELETE_EXCHANGE_RESET:
            return {
                ...state,
                isDeleted: false
            };

        case CLEAR_ERRORS:
            return {
                ...state,
                error: null
            };

        default:
            return state;
    }
}; 