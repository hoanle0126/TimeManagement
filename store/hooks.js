import { useDispatch, useSelector } from 'react-redux';
import { store } from './store';

// Typed hooks để sử dụng trong components
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

