'use client'

import { useState, useEffect } from 'react'
import { PrismaClient } from '@prisma/client'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Phone, Calendar, Eye, MessageSquare } from 'lucide-react'

interface ContactMessage {
  id: string
  nombre: string
  email: string
  telefono: string
  asunto: string
  mensaje: string
  isRead: boolean
  createdAt: string
  updatedAt: string
}

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/admin/contact-messages')
      const data = await response.json()
      if (data.success) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      const response = await fetch(`/api/admin/contact-messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true }),
      })
      
      if (response.ok) {
        setMessages(messages.map(msg => 
          msg.id === messageId ? { ...msg, isRead: true } : msg
        ))
      }
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const unreadCount = messages.filter(msg => !msg.isRead).length

  if (loading) {
    return <div className="p-6">Cargando mensajes...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mensajes de Contacto</h1>
          <p className="text-gray-600">
            {messages.length} mensajes total, {unreadCount} sin leer
          </p>
        </div>
        <Button onClick={fetchMessages} variant="outline">
          Actualizar
        </Button>
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay mensajes
            </h3>
            <p className="text-gray-600">
              Cuando recibas mensajes de contacto aparecerán aquí.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estado</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Asunto</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message) => (
                <TableRow key={message.id} className={!message.isRead ? 'bg-blue-50' : ''}>
                  <TableCell>
                    {message.isRead ? (
                      <Badge variant="secondary">Leído</Badge>
                    ) : (
                      <Badge variant="default">Nuevo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{message.nombre}</TableCell>
                  <TableCell>{message.email}</TableCell>
                  <TableCell className="max-w-xs truncate">{message.asunto}</TableCell>
                  <TableCell>
                    {format(new Date(message.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedMessage(message)
                            if (!message.isRead) {
                              markAsRead(message.id)
                            }
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Mensaje de Contacto</DialogTitle>
                        </DialogHeader>
                        {selectedMessage && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-gray-500">Nombre</label>
                                <p className="text-sm">{selectedMessage.nombre}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">Email</label>
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-gray-400" />
                                  <a 
                                    href={`mailto:${selectedMessage.email}`}
                                    className="text-sm text-blue-600 hover:underline"
                                  >
                                    {selectedMessage.email}
                                  </a>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">Teléfono</label>
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-gray-400" />
                                  <a 
                                    href={`tel:${selectedMessage.telefono}`}
                                    className="text-sm text-blue-600 hover:underline"
                                  >
                                    {selectedMessage.telefono}
                                  </a>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">Fecha</label>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <p className="text-sm">
                                    {format(new Date(selectedMessage.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Asunto</label>
                              <p className="text-sm font-medium">{selectedMessage.asunto}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Mensaje</label>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm whitespace-pre-wrap">{selectedMessage.mensaje}</p>
                              </div>
                            </div>
                            <div className="flex gap-2 pt-4">
                              <Button asChild className="flex-1">
                                <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.asunto}`}>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Responder por Email
                                </a>
                              </Button>
                              <Button variant="outline" asChild>
                                <a href={`tel:${selectedMessage.telefono}`}>
                                  <Phone className="h-4 w-4 mr-2" />
                                  Llamar
                                </a>
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}