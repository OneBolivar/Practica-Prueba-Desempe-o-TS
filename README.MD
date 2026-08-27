
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

  ======================================================================
        MODULO 4: CATALOGO DE PRODUCTOS, FILTROS Y PAGINACION
======================================================================

1. ARQUITECTURA DE ARCHIVOS CREADOS / MODIFICADOS
----------------------------------------------------------------------
src/
├── types/
│   └── product.types.ts        # Modelo Product, filtros y DTOs (UUID string)
├── services/
│   └── products.service.ts     # Metodos HTTP tipados para /products con filtros
├── pages/
│   ├── ProductsPage.tsx        # Catalogo con busqueda, filtro categoria y paginacion
│   ├── ProductDetailPage.tsx   # Ficha completa, eliminacion y edicion rapida
│   └── ProductCreatePage.tsx   # Formulario unificado (creacion general o por contexto)
└── routes/
    └── appRouter.tsx           # Registro de rutas publicas y protegidas


2. DETALLE DE ARCHIVOS Y CASOS DE USO
----------------------------------------------------------------------

* src/types/product.types.ts
  - Proposito: Modela la entidad Product asegurando que los identificadores
    (id, categoryId) se mantengan como string para soportar UUIDs del backend.
  - Casos de uso: Tipado estricto en respuestas paginadas, formularios de
    creacion (CreateProductDto) y filtros de busqueda (ProductFilters).

* src/services/products.service.ts
  - Proposito: Encapsula las peticiones HTTP hacia /products.
  - Casos de uso:
    - GET /products con parametros de consulta (page, limit, search, categoryId).
    - GET /products/:id para consultar la ficha individual.
    - POST /products para dar de alta articulos.
    - PATCH /products/:id y DELETE /products/:id para edicion y borrado.

* src/pages/ProductsPage.tsx
  - Proposito: Catalogo principal paginado.
  - Casos de uso:
    - Lectura dinamica con botones "Anterior" y "Siguiente" usando total y limit.
    - Busqueda por texto (search) y filtrado por categoria (categoryId) mediante <select>.
    - Reinicio automatico a la pagina 1 cada vez que se aplica un filtro nuevo.
    - Tarjetas interactivas con enlaces hacia el detalle de cada producto.

* src/pages/ProductDetailPage.tsx
  - Proposito: Vista individual del producto consultada por su UUID desde useParams().
  - Casos de uso:
    - Muestra ficha completa: imagen con proteccion ante enlaces rotos, stock, precio.
    - Expone condicionalmente controles de edicion (PATCH) y eliminacion (DELETE)
      exclusivamente cuando isAuthenticated es true.

* src/pages/ProductCreatePage.tsx
  - Proposito: Formulario unificado de creacion de productos.
  - Casos de uso:
    - Entrada General (/products/new): Carga la lista completa de categorias y
      permite al usuario seleccionarla en un menu desplegable.
    - Entrada por Contexto (/products/new?categoryId=UUID): Detecta el parametro
      en la URL, fija el ID de la categoria y deshabilita el selector.


3. JUSTIFICACIONES TECNICAS Y CUMPLIMIENTO DE CRITERIOS
----------------------------------------------------------------------
- Reutilizacion de Componente Unico:
  Se empleo una sola vista y formulario para ambas entradas de creacion,
  evitando duplicacion de codigo y ajustando dinamicamente la interactividad
  segun la presencia del parametro categoryId en la URL.

- Manejo de Identificadores UUID:
  Se garantizo que categoryId viaje como string nativo en los payloads, evitando
  errores de conversion numerica (NaN) contra las validaciones estrictas del backend.

- Layout Resiliente ante Fallos de Imagen:
  Las etiquetas <img> incluyen manejadores onError que ocultan o reemplazan la
  imagen si la URL remota no existe o esta rota, impidiendo que el diseño visual
  de las tarjetas o de la ficha tecnica se rompa.


======================================================================
            MODULO 5: GESTION DE FAVORITOS (RELACION N:M)
======================================================================

1. ARQUITECTURA DE ARCHIVOS CREADOS / MODIFICADOS
----------------------------------------------------------------------
src/
├── services/
│   └── favorites.service.ts    # Metodos HTTP tipados para /favorites
├── pages/
│   ├── FavoritesPage.tsx       # Vista privada "Mis Favoritos" con desmarcado
│   └── ProductsPage.tsx        # Integracion de icono interactivo (toggle)
├── components/
│   └── Navbar.tsx              # Acceso condicional a la ruta /favorites
└── routes/
    └── appRouter.tsx           # Proteccion de ruta mediante ProtectedRoute


2. DETALLE DE ARCHIVOS Y CASOS DE USO
----------------------------------------------------------------------

* src/services/favorites.service.ts
  - Proposito: Centraliza las peticiones de favoritos.
  - Casos de uso:
    - GET /favorites: Obtiene el arreglo de productos guardados por el usuario logueado.
    - POST /favorites/:productId: Asocia un producto a la lista personal del usuario.
    - DELETE /favorites/:productId: Desvincula un producto de los favoritos.

* src/pages/FavoritesPage.tsx
  - Proposito: Vista privada que renderiza exclusivamente los articulos guardados.
  - Casos de uso:
    - Permite al usuario revisar sus productos favoritos en una cuadricula dedicada.
    - Permite desmarcar un articulo directamente mediante un boton "Quitar",
      actualizando el estado local en memoria sin necesidad de recargar la pagina.

* src/pages/ProductsPage.tsx (Integracion de Favoritos)
  - Proposito: Boton interactivo de alternancia (toggle 💜 / 🤍) en cada tarjeta.
  - Casos de uso:
    - Solo visible para usuarios con sesion iniciada (isAuthenticated === true).
    - Aplica actualizacion optimista de interfaz para respuesta visual instantanea.
    - Captura codigos HTTP 409 (ya agregado) y 404 (ya quitado) para mantener la
      coherencia sin arrojar alertas innecesarias al usuario.


3. JUSTIFICACIONES TECNICAS Y CUMPLIMIENTO DE CRITERIOS
----------------------------------------------------------------------
- Actualizacion Reactiva sin Recarga:
  Tanto la adicion/eliminacion desde el catalogo principal como la eliminacion
  en la pagina de favoritos operan sobre el estado local (useState), sincronizando
  la vista inmediatamente sin requerir window.location.reload().

- Manejo Controlado de Conflictos HTTP (409 y 404):
  Si el backend responde con conflicto (409) o no encontrado (404) debido a
  desfases de sincronizacion, el bloque catch procesa la excepcion de forma
  silenciosa asegurando que la interfaz mantenga el estado correcto sin romperse.


======================================================================
        MODULO 6: MANEJO DE ERRORES Y RESILIENCIA DE INTERFAZ
======================================================================

1. ARQUITECTURA DE ARCHIVOS CREADOS / MODIFICADOS
----------------------------------------------------------------------
src/
├── types/
│   └── errorBoundary.types.ts  # Modularizacion de interfaces Props y State
├── components/
│   └── ErrorBoundary.tsx       # Componente de clase desacoplado para captura de fallos de UI
├── App.tsx                     # Envoltorio global con <ErrorBoundary>
└── pages/*.tsx                 # Feedback visual consistente (loading / error)


2. DETALLE DE ARCHIVOS Y CASOS DE USO
----------------------------------------------------------------------

* src/types/errorBoundary.types.ts
  - Proposito: Modularizar y centralizar los contratos de datos del Error Boundary:
    - ErrorBoundaryProps: Define children de tipo ReactNode.
    - ErrorBoundaryState: Define hasError (boolean) y errorMessage (string).
  - Casos de uso:
    - Mantiene el principio de responsabilidad unica al separar las definiciones
      de tipos de la logica del componente.
    - Permite reutilizar o extender los contratos de error en otros limites de error
      secundarios si la aplicacion escala.

* src/components/ErrorBoundary.tsx
  - Proposito: Limite de error global que importa ErrorBoundaryProps y
    ErrorBoundaryState desde la capa de types, implementando getDerivedStateFromError
    y componentDidCatch para interceptar excepciones no controladas en el arbol de React.
  - Casos de uso:
    - Evita que un error critico de JavaScript deje la pantalla completamente en blanco.
    - Renderiza una vista amigable de contingencia con boton de recarga rapida.

* src/App.tsx
  - Proposito: Contenedor principal que envuelve toda la jerarquia con ErrorBoundary.
  - Casos de uso: Protege tanto la barra de navegacion como las rutas secundarias.

* Manejo de Estados en Todas las Vistas (src/pages/*.tsx)
  - Proposito: Aplicacion rigurosa del patron try / catch / finally.
  - Casos de uso:
    - loading: Indicador visual mientras la promesa asincrona esta pendiente.
    - errorMessage: Banner visible en caso de error HTTP o caida de red.
    - finally: Garantiza que loading pase a false sin importar si la peticion
      tuvo exito o fallo.


3. JUSTIFICACIONES TECNICAS Y CUMPLIMIENTO DE CRITERIOS
----------------------------------------------------------------------
- Modularizacion y Tipado Limpio:
  La extraccion de interfaces Props y State a un archivo dedicado de tipos
  mantiene la coherencia de la arquitectura por capas aplicada desde el Modulo 1,
  evitando tipos inline dentro de componentes de clase.

- Eliminacion de Pantallas en Blanco:
  Cualquier fallo imprevisto en tiempo de ejecucion queda atrapado por el
  ErrorBoundary, aislando el problema y permitiendo al usuario reintentar.

- Feedback Claro sobre Errores de API:
  Se erradico el uso de console.error como unico medio de reporte. Toda excepcion
  capturada se traduce a una alerta visual accesible y entendible para el usuario.


======================================================================
        MODULO 7: PRUEBAS UNITARIAS Y DE INTEGRACION
======================================================================

1. ARQUITECTURA DE ARCHIVOS CREADOS
----------------------------------------------------------------------
src/
├── utils/
│   └── formatters.ts           # Funciones puras utilitarias (moneda, texto)
└── test/
    ├── setup.ts                # Importacion de extensiones (@testing-library/jest-dom)
    ├── formatters.test.ts      # Prueba Unitaria de funcion pura
    └── LoginPage.test.tsx      # Prueba de Integracion con React Testing Library
vite.config.ts                  # Configuracion del entorno jsdom para Vitest


2. DETALLE DE ARCHIVOS Y CASOS DE USO
----------------------------------------------------------------------

* src/utils/formatters.ts
  - Proposito: Funcion pura formatCurrency(amount) que transforma valores numericos
    a formato monetario legible ($10.000).
  - Casos de uso: Formateo consistente de precios en tarjetas, detalles y tablas.

* src/test/formatters.test.ts (Prueba Unitaria)
  - Proposito: Validar la logica de formatCurrency de manera aislada.
  - Casos de uso:
    - Comprueba el formateo correcto de enteros positivos.
    - Valida que numeros negativos o valores invalidos (NaN) retornen $0 de forma segura.

* src/test/LoginPage.test.tsx (Prueba de Integracion)
  - Proposito: Simular el flujo real de un usuario al autenticarse.
  - Casos de uso:
    - Renderiza LoginPage dentro de BrowserRouter y AuthProvider.
    - Mockea exclusivamente la funcion loginService usando vi.spyOn (sin mockear toda la app).
    - Simula al usuario escribiendo email y password con userEvent.type.
    - Hace click en el boton de envio y verifica que loginService fue llamado con los datos exactos.


3. JUSTIFICACIONES TECNICAS Y CUMPLIMIENTO DE CRITERIOS
----------------------------------------------------------------------
- Ejecucion con Comando Unico:
  Las pruebas se ejecutan de extremo a extremo mediante el comando standard npm test
  (vitest run), resolviendo todas las aserciones sin bloqueos.

- Mockeo Preciso y Acotado:
  No se sobre-mockeo la aplicacion ni React Router. Se aislo unicamente la capa
  de comunicacion externa (auth.service.ts), probando la verdadera integracion
  entre componentes, estado y eventos del DOM.