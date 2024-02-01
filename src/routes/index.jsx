import { Backdrop, CircularProgress } from '@mui/material';
import { useContext } from 'react';
import { Routes as Switch, Route } from 'react-router-dom';

import { AuthContext } from '../contexts/AuthContext';
import AdminPage from '../pages/AdminPage';
import CalendarRemake from '../pages/CalendarRemake';
import Financier from '../pages/Financier';
import Form from '../pages/Form';
import Login from '../pages/Login';
import MapaTeste from '../pages/mapaTest';
import NewLogin from '../pages/NewLogin';
import Refunds from '../pages/Refunds';
import Report from '../pages/Report';
import Services from '../pages/Services';
import PrivateRoute from './PrivateRoute';

export default function Routes() {
  const { isLoading } = useContext(AuthContext);

  // return (
  //   <>
  //     <Switch>
  //       <Route path="/" exact element={<Login />} />
  //       <Route
  //         path="/form"
  //         exact
  //         element={
  //           <PrivateRoute>
  //             <Form />
  //           </PrivateRoute>
  //         }
  //       />
  //       <Route
  //         path="/admin"
  //         exact
  //         element={
  //           <PrivateRoute>
  //             <AdminPage />
  //           </PrivateRoute>
  //         }
  //       />
  //       <Route
  //         path="/financier"
  //         exact
  //         element={
  //           <PrivateRoute>
  //             <Financier />
  //           </PrivateRoute>
  //         }
  //       />
  //       <Route
  //         path="/services"
  //         exact
  //         element={
  //           <PrivateRoute>
  //             <Services />
  //           </PrivateRoute>
  //         }
  //       />
  //       <Route
  //         path="/calendar"
  //         exact
  //         element={
  //           <PrivateRoute>
  //             <CalendarRemake />
  //           </PrivateRoute>
  //         }
  //       />
  //       <Route
  //         path="/report"
  //         exact
  //         element={
  //           <PrivateRoute>
  //             <Report />
  //           </PrivateRoute>
  //         }
  //       />
  //       <Route
  //         path="/refunds"
  //         exact
  //         element={
  //           <PrivateRoute>
  //             <Refunds />
  //           </PrivateRoute>
  //         }
  //       />
  //       <Route
  //         path="/mapa"
  //         exact
  //         element={
  //           <PrivateRoute>
  //             <MapaTeste />
  //           </PrivateRoute>
  //         }
  //       />
  //     </Switch>
  //     <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoading}>
  //       <CircularProgress color="inherit" disableShrink />
  //     </Backdrop>
  //   </>
  // );

  return (
    <Switch>
      <Route path="/" exact element={<NewLogin />} />
    </Switch>
  );
}
