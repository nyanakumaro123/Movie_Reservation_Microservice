// import React from 'react';
import axios from 'axios';

const API_GATEWAY = "http://localhost:8080";

export default function Dashboard({ user, token, onLogout }) {
  const getMovieData = async () => {
    try {
      const res = await axios.get(`${API_GATEWAY}/movies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Data Film Berhasil Diambil: " + JSON.stringify(res.data.data));
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const doBooking = async () => {
    try {
      const res = await axios.post(`${API_GATEWAY}/bookings`, { seat_id: "A1" }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Booking Sukses: " + res.data.message);
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Selamat Datang, {user.name}!</h1>
          <button onClick={onLogout} className="bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-red-600">Logout</button>
        </div>
        <p className="text-gray-600 mb-6">Anda masuk sebagai Role: <span className="font-bold text-indigo-600 uppercase">{user.role}</span></p>

        <div className="space-x-4">
          <button onClick={getMovieData} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Akses Movie Service (Khusus Admin)
          </button>
          <button onClick={doBooking} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Akses Booking Service (Khusus User)
          </button>
        </div>
      </div>
    </div>
  );
}