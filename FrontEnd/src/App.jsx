import { createBrowserRouter,RouterProvider} from 'react-router-dom';
import Room from './components/room.jsx'
// import io from 'socket.io-client';
import SocketWrapper from './components/SocketWrapper.jsx';

import LoginPage from './components/login.jsx'

const router=createBrowserRouter([
  {
    path:'/',
    element:<LoginPage/>
  },
  {
    path: '/room/:roomid',
    element: <SocketWrapper><Room/></SocketWrapper>,
  }
]);
function App() {
   return <>
    <RouterProvider router={router}/></>
}

export default App
