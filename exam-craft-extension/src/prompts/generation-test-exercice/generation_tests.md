# PROMPT COMPLETO PARA GENERACIÓN DE TESTS DE LOS DISTITNOS EJERCICIOS

## Recursos a proporcionar:
* `generation_test.md`

## Prompt a utilizar:

Nuestra misión es generar, a partir de un enunciado dado, el test del ejercicio de un examen, tomando el rol de profesores para una asignatura llamada Diseño y Pruebas, para evaluar los conocimientos de los alumnos sobre mapeo objeto relacional en JPA, manejo de estas entidades y base de datos, entre otras más. Concretamente te pasaré el enunciado y el diagrama UML en código Mermaid que lo acompaña, elementos en los que te tendrás que basar para proporcionarme la solución, pero antes, te daré información de contexto que necesitarás como recurso y entender mejor qué características tiene este examen:

-	Hay que tomar el rol de profesor siempre, estamos generando un examen, hay que ponerse en los zapatos del profesorado.
-	Tenemos dos tipos de exámenes, uno enfocado a una clínica veterinaria y otro al juego del ajedrez.
-	Respecto al diagrama UML:

     - 	Concepto de colores de clases:  
         - **Clases negras**: El núcleo del sistema. Clases estables que se usan como contexto, pero que quedan fuera de la tarea de implementación. 
         - **Clases rojas**: La tarea principal del alumno, se deben crear desde 0. Las clases vienen creadas pero su contenido está vacío.

         - Las clases negras son la base de la que partimos siempre en todos los exámenes, el dominio común a todos los exámenes dependiendo de qué tipo (clínica o ajedrez) de examen estemos generando y las rojas, pueden variar según la extensión funcional que se le añada.

     -	Relaciones, cardinalidad y direccionalidad:

         - Relaciones rojas entre clases rojas: el alumno deberá añadir el atributo con su anotación de relación correspondiente. 

         - Tendremos relaciones únicamente unidireccionales.

         - La cardinalidad podrá ser de 1..1, 1, 0..1, 0..n, 1..n. Las relaciones muchos a muchos se omitirán en todos los casos.

-	Límite de 2 entidades de color rojo, es decir, a implementar por completo por el alumno, debido al tiempo disponible para realizar el examen.

Sabiendo y entendiendo esto a fondo, basándote y siguiendo la lógica de los tests que te paso en el archivo md “generation_test”, donde vienen tests de ejemplos que se han realizado para otros enunciado de examenes, quiero que me generes los tests de los distintos ejercicios del examen.

Deberá cumplir estos requisitos:

-	Para generar los tests de los ejercicios es necesario usar lenguaje y framework: Java 17+, JUnit 5, Spring Boot (@DataJpaTest). 

-	Los tests tendrán que ser parecidas a los ejemplos que te he pasado en el archivo md.

-	La clase DEBE extender de la clase base ReflexiveTest proporcionada por la asignatura..


### Para el ejercicio Test1 :

Requisitos que debe de cumplir:

- Inyecta el Repositorio de la nueva entidad y el EntityManager usando @Autowired.
- Crea el método test1RepositoriesExist(), anótalo con @Test y verifica que el repositorio no es nulo (assertNotNull).
- Crea el método test1RepositoriesContainsMethod(). ESTRICTAMENTE PROHIBIDO anotarlo con @Test. Este método debe ser llamado internamente desde el final de test1RepositoriesExist() dentro de un bloque if (repositorio != null) para evitar un NullPointerException si la inyección falla.
- Crea el método @Test public void test1Check[NOMBRE_ENTIDAD]Constraints().
- Analiza el UML proporcionado. Identifica los campos obligatorios e invoca el método heredado checkThatFieldsAreMandatory(entidad, em, "campo1", "campo2", ...).
- Analiza las restricciones del UML (tamaños, mínimos, máximos, nulos). Construye un mapa con los casos negativos (valores frontera y particiones de equivalencia).
- ESTRICTAMENTE PROHIBIDO usar new HashMap<>() o .put(). Inicializa el mapa en una sola instrucción con Java moderno: Map<String, List<Object>> invalidValues = Map.of("campo1", List.of(...), "campo2", List.of(...));.
- Invoca el método heredado checkThatValuesAreNotValid(entidad, invalidValues, em).
- Crea el método @Test public void test1Check[NOMBRE_ENTIDAD]Annotations().
- Usa el método heredado classIsAnnotatedWith(Clase.class, Entity.class) para verificar @Entity.
- Si la entidad tiene algún atributo Enum, usa reflexión para verificar que tiene la anotación @Enumerated(EnumType.STRING).
- Crea un método public static [Entidad] createValid[NOMBRE_ENTIDAD](EntityManager em).
- Usa EXCLUSIVAMENTE el método heredado setValue(entidad, "atributo", Tipo.class, valor) para asignar datos válidos a todos los atributos de la entidad, evadiendo así fallos de compilación si el alumno no ha creado los setters.
- Crea el método @Test public void test1Valid[NOMBRE_ENTIDAD]IsPersisted(). Obtén una instancia válida, guárdala con el repositorio y haz un .flush() dentro de un assertDoesNotThrow.

Por favor, no generes nada de comentarios, solo los tests para copiar lo que me devuelvas directamente para ejecutarlo.

Tampoco pongas nada de ```java y ``` 

Genera el código completo de Test1.java aplicando estas reglas a la entidad principal descrita en el UML de este examen en particular.