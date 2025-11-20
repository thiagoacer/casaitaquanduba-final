import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, MessageSquare, DollarSign, TrendingUp, Clock } from 'lucide-react';

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
  pendingContacts: number;
  totalContacts: number;
  recentBookings: Array<{
    id: string;
    guest_name: string;
    check_in: string;
    status: string;
    calculated_price: number;
  }>;
  recentContacts: Array<{
    id: string;
    name: string;
    created_at: string;
    status: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);

    const [bookingsResult, contactsResult] = await Promise.all([
      supabase
        .from('booking_inquiries')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false }),
    ]);

    if (bookingsResult.data && contactsResult.data) {
      const bookings = bookingsResult.data;
      const contacts = contactsResult.data;

      const totalRevenue = bookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + Number(b.calculated_price), 0);

      setStats({
        totalBookings: bookings.length,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
        confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
        totalRevenue,
        pendingContacts: contacts.filter(c => c.status === 'pending').length,
        totalContacts: contacts.length,
        recentBookings: bookings.slice(0, 5),
        recentContacts: contacts.slice(0, 5),
      });
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando dashboard...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Erro ao carregar dados</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total de Reservas</p>
              <p className="text-3xl font-bold mt-1">{stats.totalBookings}</p>
            </div>
            <Calendar className="w-12 h-12 text-blue-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Reservas Pendentes</p>
              <p className="text-3xl font-bold mt-1">{stats.pendingBookings}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Confirmadas</p>
              <p className="text-3xl font-bold mt-1">{stats.confirmedBookings}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0A7B9B] to-[#2EC4B6] rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm">Receita Confirmada</p>
              <p className="text-3xl font-bold mt-1">
                R$ {(stats.totalRevenue / 1000).toFixed(0)}k
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-teal-200 opacity-80" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Reservas Recentes</h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {stats.recentBookings.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhuma reserva ainda</p>
            ) : (
              stats.recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{booking.guest_name}</p>
                    <p className="text-sm text-gray-500">
                      Check-in: {new Date(booking.check_in).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      R$ {booking.calculated_price.toLocaleString('pt-BR')}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-700'
                          : booking.status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {booking.status === 'confirmed'
                        ? 'Confirmada'
                        : booking.status === 'cancelled'
                        ? 'Cancelada'
                        : 'Pendente'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Contatos Recentes</h2>
            <MessageSquare className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {stats.recentContacts.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum contato ainda</p>
            ) : (
              stats.recentContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{contact.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(contact.created_at).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(contact.created_at).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      contact.status === 'read'
                        ? 'bg-blue-100 text-blue-700'
                        : contact.status === 'archived'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {contact.status === 'read'
                      ? 'Lido'
                      : contact.status === 'archived'
                      ? 'Arquivado'
                      : 'Novo'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {stats.pendingContacts > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-1">
                Você tem {stats.pendingContacts} {stats.pendingContacts === 1 ? 'contato pendente' : 'contatos pendentes'}
              </h3>
              <p className="text-yellow-800 text-sm">
                Não se esqueça de responder aos contatos pendentes para manter um bom atendimento aos clientes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
