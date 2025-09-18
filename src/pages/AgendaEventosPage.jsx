import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/ui/Navbar';

const AgendaEventosPage = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Feira do Agronegócio 2025',
      date: '2025-08-15',
      time: '08:00',
      location: 'São Paulo Expo',
      type: 'feira',
      description: 'A maior feira do agronegócio do Brasil'
    },
    {
      id: 2,
      title: 'Workshop: Agricultura 4.0',
      date: '2025-07-25',
      time: '14:00',
      location: 'Online',
      type: 'workshop',
      description: 'Tecnologias emergentes na agricultura'
    },
    {
      id: 3,
      title: 'Congresso de Sustentabilidade',
      date: '2025-09-10',
      time: '09:00',
      location: 'Centro de Convenções - Brasília',
      type: 'congresso',
      description: 'Práticas sustentáveis no agronegócio'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    type: 'workshop',
    description: ''
  });

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.date && newEvent.time) {
      setEvents([...events, {
        id: Date.now(),
        ...newEvent
      }]);
      setNewEvent({
        title: '',
        date: '',
        time: '',
        location: '',
        type: 'workshop',
        description: ''
      });
      setShowAddForm(false);
    }
  };

  const handleDeleteEvent = (id) => {
    setEvents(events.filter(event => event.id !== id));
  };

  const getEventTypeColor = (type) => {
    const colors = {
      feira: 'bg-blue-500',
      workshop: 'bg-green-500',
      congresso: 'bg-purple-500',
      reuniao: 'bg-orange-500',
      curso: 'bg-red-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const getEventTypeIcon = (type) => {
    const icons = {
      feira: '🏪',
      workshop: '🛠️',
      congresso: '🎯',
      reuniao: '👥',
      curso: '📚'
    };
    return icons[type] || '📅';
  };

  const filteredEvents = events.filter(event => 
    event.date === selectedDate
  );

  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4">Agenda de Eventos</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Gerencie seus eventos e compromissos do agronegócio
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendário e Controles */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              {/* Seletor de Data */}
              <div className="bg-gray-900 rounded-2xl p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">Selecionar Data</h3>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                />
              </div>

              {/* Próximos Eventos */}
              <div className="bg-gray-900 rounded-2xl p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">Próximos Eventos</h3>
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <span className="text-lg mr-2">{getEventTypeIcon(event.type)}</span>
                        <h4 className="font-medium text-sm">{event.title}</h4>
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(event.date).toLocaleDateString('pt-BR')} às {event.time}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{event.location}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botão Adicionar Evento */}
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                ➕ Adicionar Evento
              </button>
            </motion.div>

            {/* Lista de Eventos do Dia */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <div className="bg-gray-900 rounded-2xl p-6">
                <h3 className="text-2xl font-semibold mb-6">
                  Eventos de {new Date(selectedDate).toLocaleDateString('pt-BR')}
                </h3>

                {filteredEvents.length > 0 ? (
                  <div className="space-y-4">
                    {filteredEvents.map((event) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors duration-300"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-3">
                              <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)} mr-3`}></div>
                              <span className="text-2xl mr-3">{getEventTypeIcon(event.type)}</span>
                              <h4 className="text-xl font-semibold">{event.title}</h4>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <div className="flex items-center text-gray-300">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{event.time}</span>
                              </div>
                              <div className="flex items-center text-gray-300">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>{event.location}</span>
                              </div>
                            </div>

                            {event.description && (
                              <p className="text-gray-400 mb-4">{event.description}</p>
                            )}

                            <div className="flex items-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getEventTypeColor(event.type)}`}>
                                {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="ml-4 p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors duration-300"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-400">Nenhum evento agendado para esta data</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Modal Adicionar Evento */}
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gray-900 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
              >
                <h3 className="text-2xl font-semibold mb-6">Adicionar Evento</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Título do Evento *
                    </label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                      placeholder="Nome do evento"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Data *
                      </label>
                      <input
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Horário *
                      </label>
                      <input
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Local
                    </label>
                    <input
                      type="text"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                      placeholder="Local do evento"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tipo de Evento
                    </label>
                    <select
                      value={newEvent.type}
                      onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                    >
                      <option value="workshop">Workshop</option>
                      <option value="feira">Feira</option>
                      <option value="congresso">Congresso</option>
                      <option value="reuniao">Reunião</option>
                      <option value="curso">Curso</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white resize-none"
                      placeholder="Descrição do evento"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddEvent}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                  >
                    Adicionar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default AgendaEventosPage;

