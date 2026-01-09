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
import AdminBookingDetails from './pages/admin/Bookings/BookingDetails';
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
import BrowseCars from './pages/user/BrowseCars/BrowseCars';
import CarDetails from './pages/user/BrowseCars/CarDetails';
import CreateBooking from './pages/user/Booking/CreateBooking';
import BookingSuccess from './pages/user/Booking/BookingSuccess';
import MyBookings from './pages/user/MyBookings/MyBookings';
import UserBookingDetails from './pages/user/MyBookings/BookingDetails';
import Profile from './pages/user/Profile/Profile';
import PaymentPage from './pages/user/Payment/PaymentPage';
import PaymentSuccess from './pages/user/Payment/PaymentSuccess';
import LiveTracking from './pages/user/LiveTracking/LiveTracking';

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
            <Route path="browse-cars" element={<BrowseCars />} />
            <Route path="cars/:id" element={<CarDetails />} />
            <Route path="create-booking" element={<CreateBooking />} />
            <Route path="payment" element={<PaymentPage />} />
            <Route path="booking-success" element={<BookingSuccess />} />
            <Route path="payment-success" element={<PaymentSuccess />} />
            <Route path="my-bookings" element={<MyBookings />} />
            <Route path="booking-details/:id" element={<UserBookingDetails />} />
            <Route path="track-live/:id" element={<LiveTracking />} />
            <Route path="profile" element={<Profile />} />
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
            <Route path="bookings/:id" element={<AdminBookingDetails />} />
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