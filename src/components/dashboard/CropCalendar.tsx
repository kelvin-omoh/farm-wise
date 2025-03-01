import { useState, useEffect } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useAuthStore } from '../../stores/authStore'
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { Timestamp } from 'firebase/firestore'
import { FaPlus, FaTimes } from 'react-icons/fa'
import { useTestDataStore } from '../../stores/testDataStore'
import { isIndexError } from '../../services/firebaseService'
import IndexNotification from '../../components/ui/IndexNotification'

// Define types
interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    type: 'planting' | 'irrigation' | 'harvesting' | 'other';
    details?: string;
    color?: string;
}

export const CropCalendar = () => {
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
    const [newEvent, setNewEvent] = useState({
        title: '',
        start: new Date(),
        end: new Date(),
        allDay: true,
        type: 'planting' as 'planting' | 'irrigation' | 'harvesting' | 'other',
        details: ''
    })
    const [error, setError] = useState<string | null>(null)
    const [showIndexNotification, setShowIndexNotification] = useState(false)

    const { user } = useAuthStore()
    const { useTestData, setUseTestData } = useTestDataStore()
    const farmId = user?.farm_id || 'default'
    const localizer = momentLocalizer(moment)

    // Test data for events
    const testEvents: CalendarEvent[] = [
        {
            id: '1',
            title: 'Corn Planting',
            start: new Date(new Date().setDate(new Date().getDate() - 2)),
            end: new Date(new Date().setDate(new Date().getDate() - 1)),
            allDay: true,
            type: 'planting',
            details: 'Plant corn in north field',
            color: '#10B981'
        },
        {
            id: '2',
            title: 'Tomato Irrigation',
            start: new Date(),
            end: new Date(),
            allDay: true,
            type: 'irrigation',
            details: 'Water tomato plants in greenhouse',
            color: '#3B82F6'
        },
        {
            id: '3',
            title: 'Cassava Harvesting',
            start: new Date(new Date().setDate(new Date().getDate() + 5)),
            end: new Date(new Date().setDate(new Date().getDate() + 6)),
            allDay: true,
            type: 'harvesting',
            details: 'Harvest cassava in south field',
            color: '#F59E0B'
        }
    ]

    // Fetch events from Firebase
    useEffect(() => {
        if (useTestData) {
            setEvents(testEvents)
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)

        try {
            const q = query(collection(db, 'farm_events'), where('farm_id', '==', farmId))

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedEvents = snapshot.docs.map(doc => {
                    const data = doc.data()
                    return {
                        id: doc.id,
                        title: data.title,
                        start: data.start.toDate(),
                        end: data.end.toDate(),
                        allDay: data.allDay,
                        type: data.type,
                        details: data.details,
                        color: getEventColor(data.type)
                    }
                })

                setEvents(fetchedEvents)
                setLoading(false)
            }, (error) => {
                console.error("Error fetching events:", error)
                setError('Failed to fetch calendar events')

                if (isIndexError(error)) {
                    setShowIndexNotification(true)
                    setUseTestData(true)
                    setEvents(testEvents)
                } else {
                    setEvents([])
                }

                setLoading(false)
            })

            return () => unsubscribe()
        } catch (error) {
            console.error("Error setting up events listener:", error)
            setError('Failed to connect to database')
            setEvents(testEvents)
            setLoading(false)
        }
    }, [farmId, useTestData])

    // Get color based on event type
    const getEventColor = (type: string): string => {
        switch (type) {
            case 'planting': return '#10B981' // green
            case 'irrigation': return '#3B82F6' // blue
            case 'harvesting': return '#F59E0B' // amber
            default: return '#6B7280' // gray
        }
    }

    // Add new event
    const handleAddEvent = async () => {
        if (!newEvent.title) {
            setError('Title is required')
            return
        }

        try {
            if (useTestData) {
                // Simulate adding to test data
                const newId = (Math.max(...events.map(e => parseInt(e.id))) + 1).toString()
                const newTestEvent: CalendarEvent = {
                    id: newId,
                    title: newEvent.title,
                    start: newEvent.start,
                    end: newEvent.end,
                    allDay: newEvent.allDay,
                    type: newEvent.type,
                    details: newEvent.details,
                    color: getEventColor(newEvent.type)
                }
                setEvents([...events, newTestEvent])
                resetForm()
                setShowModal(false)
                return
            }

            await addDoc(collection(db, 'farm_events'), {
                farm_id: farmId,
                title: newEvent.title,
                start: Timestamp.fromDate(newEvent.start),
                end: Timestamp.fromDate(newEvent.end),
                allDay: newEvent.allDay,
                type: newEvent.type,
                details: newEvent.details,
                created_at: Timestamp.now()
            })

            resetForm()
            setShowModal(false)
        } catch (error) {
            console.error("Error adding event:", error)
            setError('Failed to add event')
        }
    }

    // Update event
    const handleUpdateEvent = async () => {
        if (!selectedEvent) return
        if (!newEvent.title) {
            setError('Title is required')
            return
        }

        try {
            if (useTestData) {
                // Simulate updating test data
                const updatedEvents = events.map(event =>
                    event.id === selectedEvent.id
                        ? {
                            ...event,
                            title: newEvent.title,
                            start: newEvent.start,
                            end: newEvent.end,
                            allDay: newEvent.allDay,
                            type: newEvent.type,
                            details: newEvent.details,
                            color: getEventColor(newEvent.type)
                        }
                        : event
                )
                setEvents(updatedEvents)
                resetForm()
                setShowModal(false)
                return
            }

            await updateDoc(doc(db, 'farm_events', selectedEvent.id), {
                title: newEvent.title,
                start: Timestamp.fromDate(newEvent.start),
                end: Timestamp.fromDate(newEvent.end),
                allDay: newEvent.allDay,
                type: newEvent.type,
                details: newEvent.details
            })

            resetForm()
            setShowModal(false)
        } catch (error) {
            console.error("Error updating event:", error)
            setError('Failed to update event')
        }
    }

    // Delete event
    const handleDeleteEvent = async () => {
        if (!selectedEvent) return

        try {
            if (useTestData) {
                // Simulate deleting from test data
                setEvents(events.filter(event => event.id !== selectedEvent.id))
                resetForm()
                setShowModal(false)
                return
            }

            await deleteDoc(doc(db, 'farm_events', selectedEvent.id))
            resetForm()
            setShowModal(false)
        } catch (error) {
            console.error("Error deleting event:", error)
            setError('Failed to delete event')
        }
    }

    // Reset form
    const resetForm = () => {
        setNewEvent({
            title: '',
            start: new Date(),
            end: new Date(),
            allDay: true,
            type: 'planting',
            details: ''
        })
        setSelectedEvent(null)
        setError(null)
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            {showIndexNotification && <IndexNotification />}

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Farm Calendar</h2>
                <div className="flex items-center space-x-4">
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                            resetForm()
                            setShowModal(true)
                        }}
                    >
                        <FaPlus className="mr-2" /> Add Event
                    </button>
                </div>
            </div>

            {error && !showIndexNotification && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div style={{ height: 600 }}>
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        eventPropGetter={(event: CalendarEvent) => ({
                            style: { backgroundColor: event.color || getEventColor(event.type) }
                        })}
                        views={['month', 'week', 'day']}
                        onSelectEvent={(event: CalendarEvent) => {
                            setSelectedEvent(event)
                            setNewEvent({
                                title: event.title,
                                start: event.start,
                                end: event.end,
                                allDay: event.allDay,
                                type: event.type,
                                details: event.details || ''
                            })
                            setShowModal(true)
                        }}
                        onSelectSlot={(slotInfo: any) => {
                            resetForm()
                            setNewEvent({
                                ...newEvent,
                                start: slotInfo.start,
                                end: slotInfo.end,
                                allDay: slotInfo.slots.length > 1
                            })
                            setShowModal(true)
                        }}
                        selectable
                    />
                </div>
            )}

            {/* Add/Edit Event Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                {selectedEvent ? 'Edit Event' : 'Add New Event'}
                            </h3>
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => setShowModal(false)}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date *
                                </label>
                                <input
                                    type="datetime-local"
                                    className="input input-bordered w-full"
                                    value={moment(newEvent.start).format('YYYY-MM-DDTHH:mm')}
                                    onChange={(e) => setNewEvent({
                                        ...newEvent,
                                        start: new Date(e.target.value)
                                    })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date *
                                </label>
                                <input
                                    type="datetime-local"
                                    className="input input-bordered w-full"
                                    value={moment(newEvent.end).format('YYYY-MM-DDTHH:mm')}
                                    onChange={(e) => setNewEvent({
                                        ...newEvent,
                                        end: new Date(e.target.value)
                                    })}
                                    required
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="checkbox mr-2"
                                    checked={newEvent.allDay}
                                    onChange={(e) => setNewEvent({ ...newEvent, allDay: e.target.checked })}
                                />
                                <label className="text-sm font-medium text-gray-700">
                                    All Day Event
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Event Type
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={newEvent.type}
                                    onChange={(e) => setNewEvent({
                                        ...newEvent,
                                        type: e.target.value as 'planting' | 'irrigation' | 'harvesting' | 'other'
                                    })}
                                >
                                    <option value="planting">Planting</option>
                                    <option value="irrigation">Irrigation</option>
                                    <option value="harvesting">Harvesting</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Details
                                </label>
                                <textarea
                                    className="textarea textarea-bordered w-full"
                                    value={newEvent.details}
                                    onChange={(e) => setNewEvent({ ...newEvent, details: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                {selectedEvent && (
                                    <button
                                        className="btn btn-error"
                                        onClick={handleDeleteEvent}
                                    >
                                        Delete
                                    </button>
                                )}
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={selectedEvent ? handleUpdateEvent : handleAddEvent}
                                >
                                    {selectedEvent ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
} 