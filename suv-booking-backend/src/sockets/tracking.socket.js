const Booking = require('../models/Booking.model');
const Driver = require('../models/Driver.model');
const { SOCKET_EVENTS } = require('../config/constants');

module.exports = (io) => {
  // Socket.IO connection handler
  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    console.log(`✅ New socket connection: ${socket.id}`);

    // Join booking room
    socket.on(SOCKET_EVENTS.JOIN_BOOKING_ROOM, async (data) => {
      try {
        const { bookingId, userType } = data; // userType: 'user', 'driver', 'admin'

        if (!bookingId) {
          socket.emit('error', { message: 'Booking ID is required' });
          return;
        }

        // Verify booking exists
        const booking = await Booking.findById(bookingId);
        if (!booking) {
          socket.emit('error', { message: 'Booking not found' });
          return;
        }

        const roomName = `booking_${bookingId}`;
        socket.join(roomName);
        
        console.log(`${userType} joined room: ${roomName}`);
        socket.emit('joined', { 
          message: 'Joined booking room successfully',
          room: roomName
        });

        // Send current booking status
        socket.emit(SOCKET_EVENTS.BOOKING_UPDATE, {
          bookingId: booking._id,
          status: booking.status,
          driver: booking.driver,
          actualPickupTime: booking.actualPickupTime
        });

      } catch (error) {
        console.error('Join booking room error:', error);
        socket.emit('error', { message: 'Failed to join booking room' });
      }
    });

    // Leave booking room
    socket.on(SOCKET_EVENTS.LEAVE_BOOKING_ROOM, (data) => {
      try {
        const { bookingId } = data;
        const roomName = `booking_${bookingId}`;
        socket.leave(roomName);
        console.log(`Socket ${socket.id} left room: ${roomName}`);
      } catch (error) {
        console.error('Leave booking room error:', error);
      }
    });

    // Driver location update
    socket.on(SOCKET_EVENTS.DRIVER_LOCATION, async (data) => {
      try {
        const { bookingId, driverId, lat, lng, speed, accuracy } = data;

        if (!bookingId || !lat || !lng) {
          socket.emit('error', { message: 'Missing required location data' });
          return;
        }

        // Update driver location in database
        if (driverId) {
          await Driver.findByIdAndUpdate(driverId, {
            currentLocation: {
              type: 'Point',
              coordinates: [lng, lat]
            },
            lastLocationUpdate: new Date()
          });
        }

        // Add GPS log to booking
        const booking = await Booking.findById(bookingId);
        if (booking && booking.status === 'started') {
          booking.gpsLogs.push({
            lat,
            lng,
            timestamp: new Date(),
            speed,
            accuracy
          });
          await booking.save();
        }

        // Broadcast location to all users in the booking room
        const roomName = `booking_${bookingId}`;
        io.to(roomName).emit(SOCKET_EVENTS.DRIVER_LOCATION, {
          bookingId,
          lat,
          lng,
          speed,
          accuracy,
          timestamp: new Date()
        });

      } catch (error) {
        console.error('Driver location update error:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    // Driver status update
    socket.on(SOCKET_EVENTS.DRIVER_STATUS, async (data) => {
      try {
        const { driverId, status, bookingId } = data;

        if (!driverId || !status) {
          socket.emit('error', { message: 'Driver ID and status are required' });
          return;
        }

        // Update driver status
        await Driver.findByIdAndUpdate(driverId, { status });

        // If booking ID provided, broadcast to booking room
        if (bookingId) {
          const roomName = `booking_${bookingId}`;
          io.to(roomName).emit(SOCKET_EVENTS.DRIVER_STATUS, {
            driverId,
            status,
            timestamp: new Date()
          });
        }

      } catch (error) {
        console.error('Driver status update error:', error);
        socket.emit('error', { message: 'Failed to update driver status' });
      }
    });

    // Booking status update
    socket.on(SOCKET_EVENTS.BOOKING_UPDATE, async (data) => {
      try {
        const { bookingId, status, message } = data;

        if (!bookingId) {
          socket.emit('error', { message: 'Booking ID is required' });
          return;
        }

        const roomName = `booking_${bookingId}`;
        
        // Broadcast booking update to all users in the room
        io.to(roomName).emit(SOCKET_EVENTS.BOOKING_UPDATE, {
          bookingId,
          status,
          message,
          timestamp: new Date()
        });

      } catch (error) {
        console.error('Booking update error:', error);
        socket.emit('error', { message: 'Failed to update booking' });
      }
    });

    // Handle disconnect
    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Helper function to emit to booking room (can be called from controllers)
  io.emitToBooking = (bookingId, event, data) => {
    const roomName = `booking_${bookingId}`;
    io.to(roomName).emit(event, data);
  };

  console.log('✅ Socket.IO configured successfully');
};