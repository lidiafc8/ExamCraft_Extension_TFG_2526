# GUÍA COMPLETA PARA GENERACIÓN DE EXAMEN: DISEÑO Y PRUEBAS I

## 1. EXTENSIÓN FUNCIONAL (ENUNCIADO)

**Recursos a proporcionar:**
* `ENUNCIADOS DE EJEMPLO.pdf`

### Prompt a utilizar:

  Nuestra misión es generar un enunciado tomando el rol de profesores para una asignatura llamada Diseño y Pruebas para evaluar los conocimientos de los alumnos sobre mapeo objeto relacional en JPA, manejo de estas entidades y base de datos, entre otras más. Te voy a pasar enunciados de exámenes de otros años junto con el diagrama UML en código Mermaid que lo acompaña, pero antes, te daré información de contexto que necesitarás como recurso y entender mejor qué características tiene este examen.
 
  **Rol y Contexto:**
  * Hay que tomar el rol de profesor siempre; estamos generando un examen, hay que ponerse en los zapatos del profesorado.
  * Tenemos dos tipos de exámenes, uno enfocado a una **clínica veterinaria** y otro al **juego del ajedrez**.
 
  **Sobre los Diagramas UML y Colores:**
  * **Clases negras:** El núcleo del sistema. Clases estables que se usan como contexto, pero que no forman parte de la tarea de implementación. Son la base de la que partimos siempre (dominio común).
  * **Clases azules:** La base proporcionada. Son clases ya implementadas con las que las clases rojas interactuarán. (Nota: En esta generación tú no crearás clases azules, pero debes saber que existen en los ejemplos).
  * **Clases rojas:** La tarea principal del alumno, se deben crear desde 0.
 
  **Relaciones, Cardinalidad y Restricciones:**
  * **Relaciones rojas entre clases rojas:** El alumno deberá añadir el atributo con su anotación de relación correspondiente.
  * **Relaciones rojas entre clases rojas y azules:** El atributo de la relación ya viene dado, el alumno solo tendrá que poner la anotación de relación.
  * Tendremos relaciones únicamente **unidireccionales**.
  * La cardinalidad podrá ser de `1..1`, `1`, `0..1`, `0..n`, `1..n`. **Las relaciones muchos a muchos no se pedirán en ningún caso.**
  * **Límite de 2 entidades de color rojo** (a implementar por completo por el alumno) debido al tiempo disponible.
 
  **Instrucciones de la Tarea:**
  Sabiendo esto, coge los enunciados de ejemplo del PDF adjunto como base. Tu tarea es proporcionarme una **extensión de enunciado nueva que sea funcional** del proyecto **[ajedrez / clínica veterinaria]** que cumpla estos requisitos:
 
  1.  La extensión funcional deberá añadir alguna funcionalidad nueva **no repetida** en anteriores exámenes.
  2.  **No se te pide el código Mermaid**, solo el enunciado en texto plano explicando la nueva extensión funcional.
  3.  **No añadirás ninguna nota** para el alumno ni para el profesorado.
  4.  Deberá tener la **misma estructura narrativa** que los ejemplos (principio y final del enunciado).
  5.  Deberá tener el **mismo nivel de detalle** que los ejemplos: breves descripciones de los atributos de las nuevas entidades (rojas) y sus relaciones.
  6.  Deberá mantener la base del dominio (clases negras).
  7.  Sé lo más creativo posible.
  8.  Como no generarás clases azules, simplemente genera una extensión funcional de clases rojas desde la base de clases negras.
  9.  No menciones el color de las clases en el texto.
  10. Devuélveme directamente el enunciado resultado como si fuera el del examen.

---

## 2. EJERCICIO 1 – GENERACIÓN DE DIAGRAMA UML Y RESTRICCIONES DE ATRIBUTOS (ENUNCIADO)

**Recursos a proporcionar:**
* `EJERCICIOS 1 DE EJEMPLO EXÁMENES ANTERIORES.pdf`

### Prompt a utilizar:

  Una vez que tenemos la extensión funcional completa del nuevo examen, pasaremos a la siguiente tarea.
 
  Quiero que en base a la lógica de la extensión funcional que me has pasado, me generes un diagrama UML en código Mermaid similar al de los ejemplos del documento "Enunciados de ejemplo".
 
  **Requisitos del Diagrama UML:**
  * Recuerda todo el contexto dado en la anterior petición.
  * Céntrate en el proyecto **[ajedrez / clínica veterinaria]** del que hemos creado la extensión.
  * **Clases Negras:** Mantendrás la estructura (entidad, atributos, relaciones, direccionalidad, multiplicidad) de las clases base. El color del contenido debe ser negro.
  * **Clases Rojas (Nuevas):** Añadirás toda su estructura (entidad, atributos, relaciones, direccionalidad, multiplicidad) acorde a la extensión funcional generada. El color del contenido debe ser rojo.
  * Si las relaciones tienen un nombre asignado, este debe constar en el diagrama.
 
  **Generación del Enunciado del Ejercicio 1:**
  Una vez creado el diagrama, generarás el enunciado para el Ejercicio 1 (restricciones a nivel de entidad de los atributos de las clases rojas). Usa el PDF "Ejercicios 1 de ejemplo exámenes anteriores" como referencia.
 
  * **ÚNICAMENTE** generarás las restricciones de los atributos de las clases a implementar por el alumno (rojas).
  * Las restricciones deben ser parecidas a los ejemplos del PDF.
  * Sé creativo con las restricciones (ni muy simples, ni muy complejas).
 
  **Sintaxis del Enunciado:**
 
  "Modificar las clases [“clases a implementar nuevas (rojas)”] para que sean entidades. Estas deben tener los siguientes atributos y restricciones:
 
  Para la clase [clase a implementar nueva (roja)]:
  El atributo de tipo [tipo de atributo] llamado [nombre de atributo] actuará como [opcional/obligatorio], [restricciones explicadas en forma de texto]"
 
  **Párrafo Final Obligatorio:**
  Al final del enunciado generado, añadirás este párrafo:
 
  "No modifique por ahora las anotaciones @Transient de las clases. Modificar las interfaces [repositorios de entidades nuevas a implementar por el alumno (rojas), no siendo enumerados] alojada en el mismo paquete para que extienda a CrudRepository."

---

## 3. EJERCICIO 2 – GENERACIÓN DE RELACIONES ENTRE ENTIDADES

**Recursos a proporcionar:**
* `EJERCICIOS 2 DE EJEMPLO EXÁMENES ANTERIORES.pdf`

### Prompt a utilizar:

  Una vez que tenemos la extensión funcional completa, el diagrama UML y las restricciones, pasaremos a generar el **Ejercicio 2**.
 
  En base a la lógica de la extensión funcional, el diagrama UML y las restricciones previas, describirás en detalle las relaciones a implementar por el alumno entre las entidades descritas anteriormente (clases rojas). Usa el PDF "Ejercicios 2 de ejemplos exámenes anteriores" como referencia.
 
  **Requisitos:**
  * Los atributos de las nuevas clases tendrán anotaciones `@Transient` (simulando un proyecto real a manipular) que deberán eliminarse. **Esto se debe indicar explícitamente.**
  * Las explicaciones deben ser parecidas a los ejemplos del PDF.
  * Especificar la **direccionalidad** y las **entidades implicadas**.
  * Indicar que las relaciones deben corresponderse con el diagrama UML proporcionado.
  * Indicar el nombre del atributo que identificará a la relación y la clase donde debe estar.
  * Indicar que se debe implementar correctamente la **cardinalidad**, poniendo ejemplos simples para que se entienda.
 
  **Sintaxis del Enunciado:**
 
  "Elimine las anotaciones @Transient de los métodos y atributos que las tengan en las entidades creadas en el ejercicio anterior, (así como del atributo [atributo] de la clase [clase]). Se pide crear las siguientes relaciones entre las entidades:"
 
  "Además, se pide crear dos relaciones [direccionalidad] desde “[clase origen]” hacia “[clase destino]” que representen las que aparecen en el diagrama UML, tenga en cuenta la cardinalidad que tienen usando como nombre de los atributos “[nombre de atributo] ” y “[nombre de atributo]” en la clase “[clase]”. Debe asegurarse de que las relaciones expresan adecuadamente la cardinalidad que muestra el diagrama UML, por ejemplo, algunos atributos pueden ser nulos puesto que la cardinalidad es 0..n pero otros no, porque su cardinalidad en el extremo navegable de la relación es 1..n."