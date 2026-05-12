import { createBrowserRouter } from 'react-router-dom';
import AppRouter from './AppRouter.jsx';

const createRouter = () => createBrowserRouter([
  {
    path: "*",
    element: <AppRouter />,
  },
]);

export default createRouter;
