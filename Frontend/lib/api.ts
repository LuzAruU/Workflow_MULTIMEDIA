const API_URL = 'http://127.0.0.1:8000/api'

// Obtener token del localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token')
  }
  return null
}

// Headers con autenticación
const getHeaders = () => {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

export async function testConnection() {
  try {
    const response = await fetch(`${API_URL}/test`)
    const data = await response.json()
    console.log('API Test:', data)
    return data
  } catch (error) {
    console.error('API Connection Error:', error)
    throw error
  }
}

// AUTH
export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()

  console.log('Login response status:', response.status)
  console.log('Login response data:', data)

  if (!response.ok) {
    const errorMessage = data.message || `Error ${response.status}: ${response.statusText}`
    console.error('Login error details:', {
      status: response.status,
      statusText: response.statusText,
      responseData: data
    })
    throw new Error(errorMessage)
  }

  // Guardar token
  if (data.token) {
    localStorage.setItem('auth_token', data.token)
    if (data.expires_at) {
      localStorage.setItem('token_expires_at', data.expires_at)
    }
  }

  return data
}

export async function register(nombre_completo: string, email: string, password: string, password_confirmation: string) {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ nombre_completo, email, password, password_confirmation }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Error en el registro')
    }

    // Guardar token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', data.token)
    }

    return data
  } catch (error) {
    console.error('Error in register:', error)
    throw error
  }
}

export async function logout() {
  try {
    const response = await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: getHeaders(),
    })

    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('usuarioEmail')
    }

    return response.ok
  } catch (error) {
    console.error('Error in logout:', error)
    throw error
  }
}

export async function fetchUsuarioActual() {
  try {
    const response = await fetch(`${API_URL}/me`, {
      method: 'GET',
      headers: getHeaders(),
    })

    if (!response.ok) {
      throw new Error('No autenticado')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching usuario actual:', error)
    throw error
  }
}

// PROYECTOS
export async function fetchProyectos() {
  try {
    const response = await fetch(`${API_URL}/proyectos`, {
      method: 'GET',
      headers: getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching proyectos:', error)
    throw error
  }
}

export async function createProyecto(data: {
  nombre: string
  descripcion?: string
  estado?: string
  miembros?: Array<{ usuarioId: string; rol: string }>
}) {
  try {
    console.log('Creating proyecto with data:', JSON.stringify(data, null, 2))
    
    const response = await fetch(`${API_URL}/proyectos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    
    console.log('Create response status:', response.status)
    
    const text = await response.text()
    console.log('Create response text:', text)
    
    if (!response.ok) {
      let error
      try {
        error = JSON.parse(text)
      } catch {
        error = { message: text }
      }
      throw new Error(error.message || `Error ${response.status}: ${text}`)
    }
    
    const result = JSON.parse(text)
    console.log('Proyecto created:', result)
    return result
  } catch (error) {
    console.error('Error creating proyecto:', error)
    throw error
  }
}

export async function updateProyecto(id: string, data: {
  nombre?: string
  descripcion?: string
  estado?: string
  miembros?: Array<{ usuarioId: string; rol: string }>
}) {
  try {
    const response = await fetch(`${API_URL}/proyectos/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al actualizar proyecto')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error updating proyecto:', error)
    throw error
  }
}

export async function deleteProyecto(id: string) {
  try {
    const response = await fetch(`${API_URL}/proyectos/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al eliminar proyecto')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error deleting proyecto:', error)
    throw error
  }
}

// USUARIOS
export async function fetchUsuarios() {
  try {
    const response = await fetch(`${API_URL}/usuarios`, {
      method: 'GET',
      headers: getHeaders(),
    })
    
    if (!response.ok) {
      throw new Error(`Error al obtener usuarios: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching usuarios:', error)
    throw error
  }
}

export async function fetchUsuario(id: string) {
  try {
    const response = await fetch(`${API_URL}/usuarios/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    })
    
    if (!response.ok) {
      throw new Error(`Error al obtener usuario: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching usuario:', error)
    throw error
  }
}

// TAREAS
export async function fetchTareas(proyectoId: string) {
  try {
    const response = await fetch(`${API_URL}/proyectos/${proyectoId}/tareas`, {
      method: 'GET',
      headers: getHeaders(),
    })
    
    if (!response.ok) {
      throw new Error(`Error al obtener tareas: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching tareas:', error)
    throw error
  }
}

export async function createTarea(data: {
  proyecto_id: string
  titulo: string
  descripcion?: string
  prioridad: string
  fecha_limite?: string
  ejecutor_id?: string
  qa_id?: string
}) {
  try {
    console.log('Creating tarea with data:', JSON.stringify(data, null, 2))
    
    const response = await fetch(`${API_URL}/tareas`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    
    console.log('Response status:', response.status)
    
    if (!response.ok) {
      const error = await response.json()
      console.error('Error response:', error)
      
      // Mostrar errores de validación específicos
      if (error.errors) {
        const errorMessages = Object.entries(error.errors)
          .map(([field, messages]: [string, any]) => `${field}: ${messages.join(', ')}`)
          .join('\n')
        throw new Error(`Errores de validación:\n${errorMessages}`)
      }
      
      throw new Error(error.message || 'Error al crear tarea')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error creating tarea:', error)
    throw error
  }
}

export async function updateTarea(id: string, data: {
  titulo?: string
  descripcion?: string
  prioridad?: string
  estado?: string
  fecha_limite?: string
  ejecutor_id?: string
  qa_id?: string
}) {
  try {
    const response = await fetch(`${API_URL}/tareas/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al actualizar tarea')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error updating tarea:', error)
    throw error
  }
}

export async function deleteTarea(id: string) {
  try {
    const response = await fetch(`${API_URL}/tareas/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al eliminar tarea')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error deleting tarea:', error)
    throw error
  }
}

export async function cambiarEstadoTarea(tareaId: string, estado: string) {
  try {
    const response = await fetch(`${API_URL}/tareas/${tareaId}/estado`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ estado }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al cambiar estado')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error changing task state:', error)
    throw error
  }
}

export async function fetchAdjuntos(tareaId: string) {
  try {
    const response = await fetch(`${API_URL}/tareas/${tareaId}/adjuntos`, {
      method: 'GET',
      headers: getHeaders(),
    })
    
    if (!response.ok) {
      throw new Error('Error al obtener adjuntos')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching adjuntos:', error)
    throw error
  }
}

export async function subirAdjunto(formData: FormData) {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    
    const response = await fetch(`${API_URL}/adjuntos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // No incluir Content-Type, el navegador lo añadirá automáticamente con el boundary correcto
      },
      body: formData,
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al subir adjunto')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error uploading adjunto:', error)
    throw error
  }
}

export async function eliminarAdjunto(adjuntoId: string) {
  try {
    const response = await fetch(`${API_URL}/adjuntos/${adjuntoId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    
    if (!response.ok) {
      throw new Error('Error al eliminar adjunto')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error deleting adjunto:', error)
    throw error
  }
}

export async function fetchEntregas(tareaId: string) {
  try {
    const response = await fetch(`${API_URL}/tareas/${tareaId}/entregas`, {
      method: 'GET',
      headers: getHeaders(),
    })
    
    if (!response.ok) {
      throw new Error('Error al obtener entregas')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching entregas:', error)
    throw error
  }
}

export async function crearEntrega(data: {
  tarea_id: string
  resumen: string
  metodologia?: string
}) {
  try {
    const response = await fetch(`${API_URL}/entregas`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al crear entrega')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error creating entrega:', error)
    throw error
  }
}

export async function crearRevisionQA(entregaId: string, data: {
  veredicto: 'APROBAR' | 'SOLICITAR_CAMBIOS'
  texto_retroalimentacion?: string
}) {
  try {
    const response = await fetch(`${API_URL}/entregas/${entregaId}/revision`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al crear revisión')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error creating revision:', error)
    throw error
  }
}
