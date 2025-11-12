# Endpoint necesario en el Backend

## PATCH /api/auth/profile

Este endpoint es necesario para actualizar el perfil del usuario autenticado.

### Autenticación
- Requiere token de autenticación en el header: `Authorization: Bearer <token>`

### Request Body
```json
{
  "fotoUrl": "https://ejemplo.com/foto.jpg",  // Opcional
  "descripcion": "Texto sobre el usuario...", // Opcional, máx 300 caracteres
  "intereses": ["interés1", "interés2"]       // Opcional, máx 5 intereses, cada uno 1-30 caracteres
}
```

### Validaciones requeridas
- `descripcion`: Máximo 300 caracteres
- `intereses`: Máximo 5 intereses
- Cada interés: Entre 1 y 30 caracteres
- Intereses sin duplicados (case-insensitive)

### Response Success (200)
```json
{
  "user": {
    "id": "string",
    "nombre": "string",
    "apellido": "string",
    "email": "string",
    "descripcion": "string",  // Opcional
    "fotoUrl": "string",      // Opcional
    "carrera": "string",
    "sede": "string",
    "edad": number,
    "intereses": ["string"]   // Array de strings
  }
}
```

### Response Errors
- `400 Bad Request`: Datos inválidos (validación fallida)
- `401 Unauthorized`: Token inválido o expirado
- `404 Not Found`: Endpoint no encontrado
- `500 Internal Server Error`: Error del servidor

### Ejemplo de implementación (pseudo-código)
```javascript
PATCH /api/auth/profile
- Verificar token de autenticación
- Validar datos recibidos:
  - descripcion: máx 300 chars
  - intereses: máx 5, cada uno 1-30 chars, sin duplicados
- Actualizar usuario en base de datos
- Devolver usuario actualizado
```

