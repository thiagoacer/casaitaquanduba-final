import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Phone, MessageSquare, Clock, Check, Archive, X } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Contact = Database['public']['Tables']['contact_submissions']['Row'];

export default function AdminContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'read' | 'archived'>('all');

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setContacts(data);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: 'pending' | 'read' | 'archived') => {
    const { error } = await supabase
      .from('contact_submissions')
      .update({ status })
      .eq('id', id);

    if (!error) {
      await loadContacts();
      if (selectedContact?.id === id) {
        setSelectedContact({ ...selectedContact, status });
      }
    }
  };

  const filteredContacts = contacts.filter(c => filter === 'all' || c.status === filter);

  const stats = {
    total: contacts.length,
    pending: contacts.filter(c => c.status === 'pending').length,
    read: contacts.filter(c => c.status === 'read').length,
    archived: contacts.filter(c => c.status === 'archived').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando contatos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Contatos</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-gray-400" />
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
              <p className="text-sm text-gray-600">Lidos</p>
              <p className="text-2xl font-bold text-blue-600">{stats.read}</p>
            </div>
            <Check className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Arquivados</p>
              <p className="text-2xl font-bold text-gray-600">{stats.archived}</p>
            </div>
            <Archive className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {(['all', 'pending', 'read', 'archived'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === f
                ? 'bg-gradient-to-r from-[#0A7B9B] to-[#2EC4B6] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendentes' : f === 'read' ? 'Lidos' : 'Arquivados'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mensagem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
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
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{contact.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        {contact.email}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        {contact.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 line-clamp-2 max-w-xs">
                      {contact.message}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {new Date(contact.created_at).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(contact.created_at).toLocaleTimeString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        contact.status === 'read'
                          ? 'bg-blue-100 text-blue-800'
                          : contact.status === 'archived'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {contact.status === 'read'
                        ? 'Lido'
                        : contact.status === 'archived'
                        ? 'Arquivado'
                        : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedContact(contact);
                        if (contact.status === 'pending') {
                          updateStatus(contact.id, 'read');
                        }
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

      {selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Detalhes do Contato</h2>
              <button
                onClick={() => setSelectedContact(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nome</label>
                  <p className="text-gray-900 mt-1">{selectedContact.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900 mt-1">{selectedContact.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Telefone</label>
                  <p className="text-gray-900 mt-1">{selectedContact.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Data</label>
                  <p className="text-gray-900 mt-1">
                    {new Date(selectedContact.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4" />
                  Mensagem
                </label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">Status</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(selectedContact.id, 'pending')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedContact.status === 'pending'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    }`}
                  >
                    Pendente
                  </button>
                  <button
                    onClick={() => updateStatus(selectedContact.id, 'read')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedContact.status === 'read'
                        ? 'bg-blue-500 text-white'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    Lido
                  </button>
                  <button
                    onClick={() => updateStatus(selectedContact.id, 'archived')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedContact.status === 'archived'
                        ? 'bg-gray-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Arquivar
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <a
                  href={`mailto:${selectedContact.email}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0A7B9B] to-[#2EC4B6] text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  <Mail className="w-4 h-4" />
                  Responder por Email
                </a>
                <a
                  href={`https://wa.me/55${selectedContact.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  <Phone className="w-4 h-4" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
