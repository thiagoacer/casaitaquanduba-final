import React from 'react';
import { LayoutDashboard, CalendarDays, Users, DollarSign, LogOut, FileText, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Adicionei 'calendar' na lista de tipos permitidos
type AdminPage = 'dashboard' | 'bookings' | 'contacts' | 'pricing' | 'blog' | 'calendar';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
}

export default function AdminLayout({ children, currentPage, onNavigate }: AdminLayoutProps) {
  const { signOut } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'bookings', label: 'Reservas', icon: CalendarDays },
    { id: 'calendar', label: 'Sincronização (iCal)', icon: Calendar }, // <--- NOVO ITEM
    { id: 'contacts', label: 'Contatos', icon: Users },
    { id: 'pricing', label: 'Preços', icon: DollarSign },
    { id: 'blog', label: 'Blog', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-xl font-bold text-[#0A7B9B]">Admin</span>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as AdminPage)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? 'bg-[#E5F6F5] text-[#0A7B9B]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
