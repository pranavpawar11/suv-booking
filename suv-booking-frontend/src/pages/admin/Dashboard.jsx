import React, { useState, useEffect } from 'react';
import { FiTruck, FiUsers, FiCalendar, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import carService from '../../api/services/carService';
import driverService from '../../api/services/driverService';
import bookingService from '../../api/services/bookingService';
import Loader from '../../components/common/Loader';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCars: 0,
    availableCars: 0,
    totalDrivers: 0,
    availableDrivers: 0,
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [carsRes, driversRes, bookingsRes, activeBookingsRes] = await Promise.all([
        carService.getAllCars(),
        driverService.getAllDrivers(),
        bookingService.getAllBookings({ limit: 5 }),
        bookingService.getActiveBookings(),
      ]);

      const cars = carsRes.data.cars || [];
      const drivers = driversRes.data.drivers || [];
      const bookings = bookingsRes.data.bookings || [];
      const activeBookings = activeBookingsRes.data.bookings || [];

      setStats({
        totalCars: cars.length,
        availableCars: cars.filter((c) => c.status === 'available').length,
        totalDrivers: drivers.length,
        availableDrivers: drivers.filter((d) => d.status === 'available').length,
        totalBookings: bookings.length,
        activeBookings: activeBookings.length,
        completedBookings: bookings.filter((b) => b.status === 'completed').length,
      });

      setRecentBookings(bookings.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Cars',
      value: stats.totalCars,
      subtitle: `${stats.availableCars} available`,
      icon: FiTruck,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Drivers',
      value: stats.totalDrivers,
      subtitle: `${stats.availableDrivers} available`,
      icon: FiUsers,
      color: 'bg-green-500',
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      subtitle: `${stats.activeBookings} active`,
      icon: FiCalendar,
      color: 'bg-purple-500',
    },
    {
      title: 'Completed',
      value: stats.completedBookings,
      subtitle: 'Successfully completed',
      icon: FiTrendingUp,
      color: 'bg-orange-500',
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      advance_paid: 'bg-blue-100 text-blue-800',
      driver_assigned: 'bg-indigo-100 text-indigo-800',
      started: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to your admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="text-white text-2xl" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
        </div>
        <div className="overflow-x-auto">
          {recentBookings.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Car
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.bookingId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.user?.name}</div>
                      <div className="text-xs text-gray-500">{booking.user?.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.car?.name}</div>
                      <div className="text-xs text-gray-500">{booking.car?.model}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 truncate max-w-xs">
                        {booking.pickup?.address}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">
                        to {booking.drop?.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{booking.pricing?.totalAmount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500">No bookings found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;