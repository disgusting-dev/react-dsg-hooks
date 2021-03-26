import { useEffect, useReducer } from 'react';

/* Interfaces */
interface IResponse {
  data?: any,
  error?: Error,
}

interface IAction extends IResponse {
  type: string,
}

interface IState extends IResponse{
  status: string,
}

/* Enums */
enum RequestStatus {
  Idle = 'idle',
  Loading = 'loading',
  Error = 'error',
  Success = 'success'
}

export enum RequestMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

/* Reducers */
const fetchReducer = (state: IState, { type, error, data }: IAction): IState =>{
  switch (type) {
    case RequestStatus.Loading:
      return { status: RequestStatus.Loading };

    case RequestStatus.Error:
      return { status: RequestStatus.Error, error };

    case RequestStatus.Success:
      return { status: RequestStatus.Success, data };

    default:
      return state;
  }
}

/* State */
const defaultState: IState = { status: RequestStatus.Idle };

/**
 * @param url endpoint
 * @returns State of the endpoint response
 * The hook for allocating httpClient logic in one place
 */
export function useFetch(
  url: string,
  method: RequestMethods = RequestMethods.GET,
  params?: RequestInit,
): IState {
  const [state, dispatch] = useReducer(fetchReducer, defaultState);

  useEffect(() => {
    let isSubscribed: boolean = true;

    dispatch({ type: RequestStatus.Loading });

    const fetchData = async () => {
      try {
        const response = await fetch(url, {
          ...params,
          method,
        });

        if (!response || !response.ok) {
          throw new Error("Request failed")
        }

        if (isSubscribed) {
          const data = await response.json();

          dispatch({ type: RequestStatus.Success, data });
        }

      } catch (error) {
        dispatch({ type: RequestStatus.Error, error })
      }
    };

    fetchData();

    return () => {
      isSubscribed = false;
    }
  }, [method, params, url]);

  return state;
}