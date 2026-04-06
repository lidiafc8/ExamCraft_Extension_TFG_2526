# PROMPT COMPLETO PARA GENERACIÓN DE TESTS DE LOS DISTITNOS EJERCICIOS

## Recursos a proporcionar:
* `generation_test.md`

## Prompt a utilizar
Nuestra misión es generar el test de un examen de la asignatura "Diseño y Pruebas". Actuamos como profesores evaluando conocimientos de JPA y mapeo objeto-relacional. Te proporcionaré el enunciado, el diagrama UML en Mermaid y, **CRÍTICAMENTE, el Código Base de las clases ya generadas**.

## Reglas de Oro de Coherencia (Prioridad Máxima)
1.  **Sincronización Obligatoria de Paquetes:** Está ESTRICTAMENTE PROHIBIDO usar paquetes genéricos como `org.springframework.samples.petclinic.model` si el Código Base proporcionado usa rutas específicas (ej. `...petclinic.boardingstay`). Debes leer la primera línea (`package ...`) de cada clase proporcionada y replicarla en los `import` del test.
2.  **Fidelidad al Código Base:** Si una clase en el código base tiene un atributo con un nombre específico (ej. `checkInDate`), el test debe usar ese nombre exacto, ignorando lo que diga cualquier otro ejemplo externo.
3.  **Manejo de Relaciones:** Si en el Código Base una relación está marcada como `@Transient`, el test debe tratarla según las instrucciones del enunciado, pero siempre importando la clase desde su paquete real.

## Especificaciones del Examen
- **Clases Negras:** Núcleo estable (Contexto). No se testea su implementación interna, pero se usan para crear objetos válidos (ej. `Owner`, `Pet`).
- **Clases Rojas:** Tarea principal del alumno. Son las que debemos testear exhaustivamente (Restricciones, Anotaciones y Persistencia).
- **Límite:** Máximo 2 entidades rojas por examen.
- **Framework:** Java 17+, JUnit 5, Spring Boot (@DataJpaTest).
- **Herencia:** La clase de test DEBE extender de `ReflexiveTest`.

---

## Estructura Requerida para Test1.java

### 1. Configuración e Inyección
- Inyecta los Repositorios de las entidades rojas y el `EntityManager` mediante `@Autowired`.
- Usa `@ComponentScan` apuntando a los paquetes reales detectados en el Código Base.

### 2. Verificación de Repositorios
- **test1RepositoriesExist():** Verifica `assertNotNull`. Al final, debe llamar a `test1RepositoriesContainsMethod()` solo si el repo no es nulo.
- **test1RepositoriesContainsMethod():** (SIN @Test) Verifica que el repo tiene el método `.count()` o similar mediante reflexión/interfaz.

### 3. Validación de Restricciones (Constraints)
- **test1Check[NOMBRE_ENTIDAD]Constraints():**
    - Invoca `checkThatFieldsAreMandatory` con los campos `NotNull/NotBlank` identificados.
    - Crea el mapa `invalidValues` usando `Map.of(...)`. **PROHIBIDO usar `new HashMap()`**.
    - Los valores de prueba deben ser coherentes con el tipo de dato del Código Base (si es `Double`, usa `0.0`; si es `Integer`, `0`).
    - Invoca `checkThatValuesAreNotValid`.

### 4. Verificación de Anotaciones
- **test1Check[NOMBRE_ENTIDAD]Annotations():**
    - Verifica `@Entity` con `classIsAnnotatedWith`.
    - Verifica `@Enumerated(EnumType.STRING)` si hay Enums.
    - Verifica `@Size`, `@Positive`, `@FutureOrPresent`, etc., según el UML.

### 5. Métodos Auxiliares y Persistencia
- **createValid[NOMBRE_ENTIDAD](EntityManager em):** Método estático que construye una instancia válida.
- **IMPORTANTE:** Usa EXCLUSIVAMENTE `setValue(objeto, "atributo", Tipo.class, valor)` para asignar datos, evitando fallos si no existen setters.
- **test1Valid[NOMBRE_ENTIDAD]IsPersisted():** Verifica que `repo.save()` no lanza excepciones (`assertDoesNotThrow`) y haz `.flush()`.

---

## Restricciones de Salida (Formato)
- **PROHIBIDO** generar comentarios explicativos.
- **PROHIBIDO** envolver el código en bloques de código markdown (sin \`\`\`java).
- **PROHIBIDO** incluir texto antes o después del código.
- Entrega el código listo para ser copiado y pegado en un archivo `.java`.

