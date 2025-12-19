import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, Users, DollarSign, Clock, Check, X, FileText } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Booking = Database['public']['Tables']['booking_inquiries']['Row'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('booking_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBookings(data);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: 'pending' | 'confirmed' | 'cancelled') => {
    const { error } = await supabase
      .from('booking_inquiries')
      .update({ status, last_updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      await loadBookings();
      if (selectedBooking?.id === id) {
        setSelectedBooking({ ...selectedBooking, status });
      }
    }
  };

  const updateAdminNotes = async () => {
    if (!selectedBooking) return;

    const { error } = await supabase
      .from('booking_inquiries')
      .update({ admin_notes: adminNotes, last_updated_at: new Date().toISOString() })
      .eq('id', selectedBooking.id);

    if (!error) {
      await loadBookings();
      setSelectedBooking({ ...selectedBooking, admin_notes: adminNotes });
    }
  };

  const filteredBookings = bookings.filter(b => filter === 'all' || b.status === filter);

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando reservas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Reservas</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmadas</p>
              <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
            </div>
            <Check className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Canceladas</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
            <X className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === f
                ? 'bg-gradient-to-r from-[#0A7B9B] to-[#2EC4B6] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendentes' : f === 'confirmed' ? 'Confirmadas' : 'Canceladas'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hóspede
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-in/out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pessoas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{booking.guest_name}</div>
                      <div className="text-sm text-gray-500">{booking.guest_email}</div>
                      <div className="text-sm text-gray-500">{booking.guest_phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="text-gray-900">
                        {new Date(booking.check_in).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-gray-500">
                        {new Date(booking.check_out).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-gray-400 text-xs">{booking.num_nights} noites</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-900">
                      <Users className="w-4 h-4" />
                      {booking.num_guests}
                    </div>
                    {booking.is_large_group && (
                      <span className="text-xs text-orange-600 font-medium">Grupo Grande</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                      <DollarSign className="w-4 h-4" />
                      {booking.calculated_price.toLocaleString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {booking.status === 'confirmed'
                        ? 'Confirmada'
                        : booking.status === 'cancelled'
                        ? 'Cancelada'
                        : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setAdminNotes(booking.admin_notes || '');
                      }}
                      className="text-[#2EC4B6] hover:text-[#0A7B9B] font-medium text-sm transition-colors"
                    >
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Detalhes da Reserva</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nome</label>
                  <p className="text-gray-900 mt-1">{selectedBooking.guest_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900 mt-1">{selectedBooking.guest_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Telefone</label>
                  <p className="text-gray-900 mt-1">{selectedBooking.guest_phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Número de Pessoas</label>
                  <p className="text-gray-900 mt-1">{selectedBooking.num_guests}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Check-in</label>
                  <p className="text-gray-900 mt-1">
                    {new Date(selectedBooking.check_in).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Check-out</label>
                  <p className="text-gray-900 mt-1">
                    {new Date(selectedBooking.check_out).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Noites</label>
                  <p className="text-gray-900 mt-1">{selectedBooking.num_nights}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Valor Total</label>
                  <p className="text-gray-900 mt-1 font-semibold">
                    R$ {selectedBooking.calculated_price.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>

              {selectedBooking.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Observações do Cliente
                  </label>
                  <p className="text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg">{selectedBooking.notes}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">
                  Notas Administrativas
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent outline-none"
                  placeholder="Adicione notas internas sobre esta reserva..."
                />
                <button
                  onClick={updateAdminNotes}
                  className="mt-2 px-4 py-2 bg-gradient-to-r from-[#0A7B9B] to-[#2EC4B6] text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Salvar Notas
                </button>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">Status</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(selectedBooking.id, 'pending')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedBooking.status === 'pending'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    }`}
                  >
                    Pendente
                  </button>
                  <button
                    onClick={() => updateStatus(selectedBooking.id, 'confirmed')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedBooking.status === 'confirmed'
                        ? 'bg-green-500 text-white'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => updateStatus(selectedBooking.id, 'cancelled')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedBooking.status === 'cancelled'
                        ? 'bg-red-500 text-white'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
