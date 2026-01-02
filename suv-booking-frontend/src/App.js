import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';

// Admin Pages
import AdminLogin from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import CarsList from './pages/admin/Cars/CarsList';
import AddCar from './pages/admin/Cars/AddCar';
import EditCar from './pages/admin/Cars/EditCar';
import DriversList from './pages/admin/Drivers/DriversList';
import AddDriver from './pages/admin/Drivers/AddDriver';
import EditDriver from './pages/admin/Drivers/EditDriver';
import DriverDetails from './pages/admin/Drivers/DriverDetails';
import BookingsList from './pages/admin/Bookings/BookingsList';
import BookingDetails from './pages/admin/Bookings/BookingDetails';
import ActiveBookings from './pages/admin/Bookings/ActiveBookings';
import PaymentsList from './pages/admin/Payments/PaymentsList';
import PaymentDetails from './pages/admin/Payments/PaymentDetails';
import UsersList from './pages/admin/Users/UsersList';
import UserDetails from './pages/admin/Users/UserDetails';
import EditUser from './pages/admin/Users/EditUser';

// User Auth Pages
import UserLogin from './pages/auth/Login';
import Register from './pages/auth/Register';

// User Pages
import Home from './pages/user/Home/Home';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* User Auth Routes (Public) */}
          <Route path="/login" element={<UserLogin />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Auth Routes (Public) */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* User Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            {/* More user routes will be added here */}
            {/* <Route path="browse-cars" element={<BrowseCars />} /> */}
            {/* <Route path="my-bookings" element={<MyBookings />} /> */}
            {/* <Route path="profile" element={<Profile />} /> */}
          </Route>

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="cars" element={<CarsList />} />
            <Route path="cars/add" element={<AddCar />} />
            <Route path="cars/edit/:id" element={<EditCar />} />
            <Route path="drivers" element={<DriversList />} />
            <Route path="drivers/add" element={<AddDriver />} />
            <Route path="drivers/edit/:id" element={<EditDriver />} />
            <Route path="drivers/:id" element={<DriverDetails />} />
            <Route path="bookings" element={<BookingsList />} />
            <Route path="bookings/active" element={<ActiveBookings />} />
            <Route path="bookings/:id" element={<BookingDetails />} />
            <Route path="payments" element={<PaymentsList />} />
            <Route path="payments/:id" element={<PaymentDetails />} />
            <Route path="users" element={<UsersList />} />
            <Route path="users/:id" element={<UserDetails />} />
            <Route path="users/edit/:id" element={<EditUser />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#363636',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;