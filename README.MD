
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


  ======================================================================
        MODULO 2: AUTENTICACION, SESION Y CONTROL DE ACCESO
======================================================================

1. ARQUITECTURA DE ARCHIVOS CREADOS / MODIFICADOS
----------------------------------------------------------------------
src/
├── api/
│   └── client.ts             # Interceptores para inyectar Token y manejar 401
├── services/
│   └── auth.service.ts       # Funciones HTTP para login, register, logout y profile
├── context/
│   └── AuthContext.tsx       # Estado global, persistencia de sesion y useAuth()
├── components/
│   ├── Navbar.tsx            # Barra de navegacion condicional por estado y rol
│   └── ProtectedRoute.tsx    # Guardian de rutas (autenticacion y RBAC por rol)
├── pages/
│   ├── LoginPage.tsx         # Formulario controlado de inicio de sesion
│   └── RegisterPage.tsx      # Formulario controlado de registro
├── routes/
│   └── appRouter.tsx         # Definicion de rutas publicas y protegidas
└── App.tsx                   # Proveedores globales y montaje principal


2. DETALLE DE ARCHIVOS Y CASOS DE USO
----------------------------------------------------------------------

* src/services/auth.service.ts
  - Proposito: Centraliza las llamadas a los endpoints de autenticacion
    (POST /auth/login, POST /auth/register, POST /auth/logout, GET /users/me).
  - Casos de uso:
    - Reutilizable cada vez que se necesite consultar o alterar la sesion
      del usuario sin acoplar Axios directamente a los componentes.

* src/context/AuthContext.tsx
  - Proposito: Maneja el estado global de la sesion del usuario, restaura la
    sesion desde localStorage al recargar (validando el token con /users/me)
    y expone login(), register(), logout(), user, isAuthenticated e isLoading.
  - Casos de uso:
    - En cualquier componente donde se necesite saber si el usuario esta
      logueado o conocer su rol mediante const { user, isAuthenticated } = useAuth().

* src/components/ProtectedRoute.tsx
  - Proposito: Componente envoltorio de React Router para proteger rutas en dos
    niveles:
    1. Si no esta autenticado -> Redirige a /login.
    2. Si no tiene el rol necesario (allowedRoles) -> Redirige a /.
    3. Muestra estado de carga si la app sigue verificando la sesion inicial.
  - Casos de uso:
    - Reutilizable para proteger cualquier ruta privada futura (ej. favoritos,
      creacion/edicion de productos o paneles de administracion).

* src/pages/LoginPage.tsx & src/pages/RegisterPage.tsx
  - Proposito: Formularios controlados con React State que consumen el AuthContext
    y capturan errores devueltos por la API (400, 401, 409, caida de red)
    usando la clase ApiError para mostrarlos en la UI.
  - Casos de uso:
    - Vistas de acceso para nuevos usuarios o usuarios existentes.

* src/components/Navbar.tsx
  - Proposito: Barra de navegacion reactiva que renderiza condicionalmente
    los botones de Login/Registro o datos de usuario/Logout, y restringe
    visualmente enlaces exclusivos como "Crear Categoria" solo si user.role === 'admin'.
  - Casos de uso:
    - Menu principal de navegacion superior en toda la aplicacion.

* src/routes/appRouter.tsx
  - Proposito: Agrupacion y declaracion jerarquica de rutas publicas y privadas
    utilizando react-router-dom.
  - Casos de uso:
    - Punto unico para registrar nuevas vistas del sistema.


3. JUSTIFICACIONES TECNICAS Y CUMPLIMIENTO DE CRITERIOS
----------------------------------------------------------------------
- Control de acceso en dos niveles:
  Se implemento tanto la proteccion por estado de autenticacion general como
  el control de acceso basado en roles (RBAC) mediante propiedades en ProtectedRoute,
  impidiendo que un usuario 'user' ingrese por URL directa a rutas de 'admin'.

- Persistencia y ciclo de vida de sesion:
  El access_token se almacena en localStorage. Al iniciar o recargar la app,
  un efecto secundario en AuthContext verifica su validez contra el backend
  (GET /users/me). Si el token es invalido o expira (error 401 en el interceptor),
  la sesion se limpia inmediatamente de forma reactiva.

- Feedback al usuario ante errores:
  Los formularios no dependen de logs de consola; capturan excepciones mediante
  instanceof ApiError y renderizan mensajes claros sobre fallos de validacion,
  credenciales incorrectas, usuarios duplicados o caidas del servidor.


  ======================================================================
          MODULO 3: CRUD DE CATEGORIAS Y CONTROL DE ACCESO
======================================================================

1. ARQUITECTURA DE ARCHIVOS CREADOS / MODIFICADOS
----------------------------------------------------------------------
src/
├── services/
│   └── categories.service.ts   # Métodos HTTP tipados para /categories
├── pages/
│   ├── CategoriesPage.tsx      # Listado público general (sin paginación)
│   ├── CategoryDetailPage.tsx  # Detalle con productos y botón de acción condicional
│   └── CategoryCreatePage.tsx  # Formulario controlado de creación (solo Admin)
├── types/
│   ├── category.types.ts       # Modelo Category con relación products? y DTOs
│   └── product.types.ts        # Modelo Product y sus DTOs
└── routes/
    └── appRouter.tsx           # Rutas /categories, /categories/:id y /categories/new


2. DETALLE DE ARCHIVOS Y CASOS DE USO
----------------------------------------------------------------------

* src/services/categories.service.ts
  - Propósito: Encapsular los métodos GET, POST, PATCH y DELETE contra la API.
  - Casos de uso: Centraliza las peticiones de categorías para reutilizarlas en
    vistas públicas o en selectores dentro de formularios de productos.

* src/pages/CategoriesPage.tsx
  - Propósito: Renderizar la lista completa de categorías desde GET /categories.
  - Casos de uso: Permite a cualquier visitante explorar las categorías disponibles
    y acceder a sus detalles sin necesidad de iniciar sesión.

* src/pages/CategoryDetailPage.tsx
  - Propósito: Mostrar los detalles de una categoría específica y sus productos
    asociados desde GET /categories/:id.
  - Casos de uso:
    - Lectura pública de productos por categoría.
    - Renderiza condicionalmente el botón "+ Agregar producto a esta categoría"
      únicamente cuando isAuthenticated es true, pasando el ID por query param.

* src/pages/CategoryCreatePage.tsx
  - Propósito: Formulario controlado para registrar nuevas categorías vía POST /categories.
  - Casos de uso: Uso exclusivo de administradores para dar de alta nuevas clasificaciones.


3. JUSTIFICACIONES TECNICAS Y CUMPLIMIENTO DE CRITERIOS
----------------------------------------------------------------------
- Control de Acceso por Rol (RBAC):
  La ruta /categories/new está protegida por ProtectedRoute con allowedRoles={['admin']}.
  Cualquier usuario con rol 'user' o visitante anónimo es rechazado inmediatamente
  si intenta ingresar por interfaz o ingresando la URL directamente.

- Carga de Relaciones y Manejo de Estados:
  CategoryDetailPage maneja de forma declarativa los estados de carga, error y lista
  vacía, mapeando la relación tipada Category.products de forma segura.