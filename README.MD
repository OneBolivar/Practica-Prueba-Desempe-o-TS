
======================================================================
                        DOCUMENTACION TECNICA 
======================================================================

======================================================================
            MODULO 1: TIPADO DEL DOMINIO Y CAPA API
======================================================================

1. ARQUITECTURA DE ARCHIVOS CREADOS
----------------------------------------------------------------------
src/
├── api/
│   ├── apiError.ts    # Clase personalizada para normalizar excepciones
│   ├── client.ts      # Instancia de Axios con interceptores de Auth y Errores
│   └── request.ts     # Wrapper generico reutilizable para peticiones HTTP
└── types/
    ├── api.types.ts       # Genericos de paginacion y estructura de error del backend
    ├── auth.types.ts      # Roles, usuario y credenciales
    ├── category.types.ts  # Entidad y DTOs de categorias
    ├── product.types.ts   # Entidad, filtros y DTOs de productos
    └── index.ts           # Archivo barril para exportacion centralizada


2. DETALLE DE ARCHIVOS Y CASOS DE USO
----------------------------------------------------------------------

* src/types/api.types.ts
  - Proposito: Provee la interfaz generica PaginatedResponse<T> y el contrato
    de error estandar emitido por NestJS (ApiErrorResponse).
  - Casos de uso:
    - Al tipar llamadas a endpoints con paginacion (ej. GET /products).
    - Para cualquier entidad paginada sin reescribir propiedades (total,
      page, limit, totalPages).

* src/types/auth.types.ts
  - Proposito: Define la union de literales Role ('admin' | 'user'), la
    entidad User, y las interfaces de credenciales (LoginCredentials,
    RegisterCredentials con herencia extends).
  - Casos de uso:
    - En el estado global de autenticacion (AuthContext).
    - En componentes de rutas protegidas y guardianes de rol.
    - Para tipar los estados de formularios de Login y Registro.

* src/types/category.types.ts
  - Proposito: Modela la entidad Category y genera automaticamente los
    tipos CreateCategoryDto (con Omit) y UpdateCategoryDto (con Partial).
  - Casos de uso:
    - En el catalogo publico de categorias.
    - En el selector <select> del formulario de creacion de productos.
    - En el formulario de administracion exclusivo para crear categorias.

* src/types/product.types.ts
  - Proposito: Modela la entidad Product, los parametros de busqueda
    ProductFilters (search, categoryId, page, limit) y los DTOs de
    creacion/edicion.
  - Casos de uso:
    - En las tarjetas de producto y vistas de detalle.
    - Al sincronizar query params con la API usando useSearchParams.
    - En el formulario unificado de creacion y edicion de productos.

* src/types/index.ts
  - Proposito: Exportacion tipo barril (barrel export).
  - Casos de uso:
    - Centraliza importaciones: import { Product, User } from '@/types'.

* src/api/apiError.ts
  - Proposito: Clase ApiError que extiende de Error. Almacena el codigo de
    estado HTTP (statusCode) y una bandera booleana para fallos de red
    (isNetworkError).
  - Casos de uso:
    - En bloques try/catch de componentes y paginas para diferenciar si el
      servidor se cayo, o si devolvio 400, 401, 403, 404 o 409.

* src/api/client.ts
  - Proposito: Instancia central de Axios con interceptores de peticion
    (inyecta token Bearer) y respuesta (normaliza a ApiError y limpia
    storage ante errores 401).
  - Casos de uso:
    - Motor base que consumen todos los servicios (auth, product, category).

* src/api/request.ts
  - Proposito: Funcion generica request<T>(url, config) que resuelve peticiones
    tipadas devolviendo directamente el data tipado.
  - Casos de uso:
    - En llamadas directas o servicios donde se busque tipar la respuesta
      sin llamar a apiClient.get<T> manualmente.


3. JUSTIFICACIONES TECNICAS PARA LA EVALUACION
----------------------------------------------------------------------
- Eleccion de localStorage vs sessionStorage:
  Se utiliza localStorage para el access_token garantizando la persistencia
  de la sesion activa ante recargas de pagina y reapertura de pestañas,
  validando su vigencia contra el endpoint /users/me al iniciar la aplicacion.

- Uso justificado de Clases (ApiError):
  Se implemento una clase derivada de Error para preservar el stack trace
  nativo de JavaScript y permitir la comprobacion de tipo en tiempo de
  ejecucion con instanceof ApiError dentro de los bloques catch.