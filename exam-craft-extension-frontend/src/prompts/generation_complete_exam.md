# PROMPT COMPLETO PARA LA GENERACIÓN DE EXAMEN COMPLETO DISEÑO Y PRUEBAS I

## Recursos a proporcionar:

- `functional_extension_examples.md`
- `attribute_constraints_examples_previous_exams.md`
- `relationships_between_entities_examples_previous_exams.md`

## Prompt a utilizar:

Nuestra misión es generar un enunciado tomando el rol de profesores para una asignatura llamada Diseño y Pruebas para evaluar los conocimientos de los alumnos sobre mapeo objeto relacional en JPA, manejo de estas entidades y base de datos, entre otras más. Te voy a pasar enunciados de exámenes de otros años junto con el diagrama UML en código Mermaid que lo acompaña, pero antes, te daré información de contexto que necesitarás como recurso y entender mejor qué características tiene este examen:

- Hay que tomar el rol de profesor siempre, estamos generando un examen, hay que ponerse en los zapatos del profesorado.
- Tenemos dos tipos de exámenes, uno enfocado a una **clínica veterinaria** y otro al **juego del ajedrez**.

- Respecto a los diagramas UML que te pasaré junto con los ejemplos:

  - Concepto de colores de clases:

    - **Clases negras**: El núcleo del sistema. Clases estables que se usan como contexto, pero que quedan fuera de la tarea de implementación.

    - **Clases azules**: La base proporcionada. Son clases ya implementadas con las que las clases rojas interactuarán. Pueden estar sujetas a modificaciones para integrar las nuevas funcionalidades.

    - **Clases rojas**: La tarea principal del alumno, se deben crear desde 0. Las clases vienen creadas pero su contenido está vacío.

    - Las clases negras son la base de la que partimos siempre en todos los exámenes, el dominio común a todos los exámenes dependiendo de qué tipo (clínica o ajedrez) de examen estemos generando. Las azules son clases que el profesorado al crear las nuevas extensiones necesitaba para que hubiese un sentido lógico en la funcionalidad y las rojas, pueden variar según la extensión funcional que se le añada.

  - Relaciones, cardinalidad y direccionalidad:

    - Relaciones rojas entre clases rojas: el alumno deberá añadir el atributo con su anotación de relación correspondiente.

    - Relaciones rojas entre clases rojas y azules: el atributo de la relación ya viene dado, el alumno solo tendrá que poner la anotación de relación

    - Tendremos relaciones únicamente unidireccionales.

    - La cardinalidad podrá ser de 1..1, 1, 0..1, 0..n, 1..n. Las relaciones muchos a muchos se omitirán en todos los casos.

- Límite de 2 entidades de color rojo, es decir, a implementar por completo por el alumno, debido al tiempo disponible para realizar el examen.

Sabiendo esto, y entendiéndolo a fondo, cogerás los enunciados de exámenes de ejemplo para usarlos como base en el archivo md llamado “functional_extension_examples” que te adjunto.

### EXTENSIÓN FUNCIONAL

Teniendo estos ejemplos, tu tarea es proporcionarme una extensión de enunciado nueva que sea funcional del proyecto **[ajedrez/clínica veterinaria]**, que cumpla estos requisitos:

- La extensión funcional deberá añadir alguna funcionalidad nueva respecto a los anteriores exámenes, es decir, los exámenes pasados como ejemplo.

- **Omite en tu respuesta el código Mermaid**, devuelve solo el enunciado en texto plano explicando la nueva extensión funcional.

- Omite en tu respuesta cualquier nota dirigida hacia el alumno y al profesorado.

- La extensión funcional devuelta deberá tener la misma estructura narrativa que la de los proporcionados como ejemplo, tanto el principio como el final del enunciado.

- La extensión funcional devuelta deberá tener el mismo nivel de detalle que los proporcionados como ejemplo, ni más ni menos, dando breves descripciones de los atributos de las nuevas entidades (rojas) y sus relaciones.

- La extensión funcional deberá mantener la base del dominio.

- Sé lo más creativo posible.

- Como te he explicado antes, las clases azules eran generadas por el profesorado como apoyo de la lógica nueva creada, por lo que tú evitarás crearlas. Simplemente desde la base de clases negras, genera una extensión funcional de clases rojas usando tu creatividad.

- En ningún caso mencionarás ni explicarás el color de las clases que se van a dar, puesto que eso los alumnos lo verán en el diagrama.

- Devuélveme directamente el enunciado resultado como si fuera el del examen, sin comentarios entre medio ni indicaciones concretas generadas por ti.

- Debido a la ausencia de clases azules, omite en tu respuesta cualquier información acerca de ellas en el enunciado generado, aunque en los enunciados de ejemplos si venga.

---

Una vez que tenemos la extensión funcional completa del nuevo examen, pasaremos a la siguiente tarea que quiero que realices.

Quiero que en base a la lógica de la extensión funcional que me has pasado, me generes un diagrama UML en código Mermaid similar al de los ejemplos que te he pasado en el documento “Extensiones funcionales de ejemplo”. Ten en cuenta estos requisitos:

- Recuerda todo el contexto dado en la anterior petición.

- De los enunciados de ejemplo, céntrate en los del tipo proyecto del que hemos creado la extensión. (ajedrez o clínica veterinaria)

  - De ellos, mantendrás la estructura (entidad, atributos, relaciones, direccionalidad, multiplicidad), de las clases base, es decir, las de color negro.

- Para las nuevas clases a implementar por el alumno, es decir, clases rojas, añadirás toda su estructura (entidad, atributos, relaciones, direccionalidad, multiplicidad), acorde a la extensión funcional generada.

- Para las relaciones, si estas tienen un nombre asignado, este debe constar en el diagrama.

- El color del contenido de las clases negras debe ser negro también.

- El color del contenido de las clases rojas debe ser rojo también.

### RESTRICCIONES DE ATRIBUTOS

Una vez creado el diagrama, generarás el enunciado para el ejercicio “RESTRICCIONES DE ATRIBUTOS” del examen, es decir, las restricciones a nivel de entidad de los atributos que componen las clases a implementar por el alumno, es decir, de las clases rojas. (not null, etc). Para ello, te adjunto el archivo md llamado “attribute_constraints_examples_previous_exams” como referencia. Deberá cumplir estos requisitos:

- ÚNICAMENTE generarás las restricciones a nivel de entidad de los atributos de las clases a implementar por el alumno.

- Las restricciones tendrán que ser parecidas a los ejemplos que te he pasado en el archivo md.

- Sé lo más creativo posible en cuanto a restricciones, ni muy simples, ni muy complejas.

- El enunciado deberá seguir la siguiente sintaxis:

  _“Modificar las clases [“clases a implementar nuevas (rojas)”] para que sean entidades. Estas deben tener los siguientes atributos y restricciones:_

  _Para la clase [clase a implementar nueva (roja)]:_
  _El atributo de tipo [tipo de atributo] llamado [nombre de atributo] actuará como [opcional/obligatorio], [restricciones explicadas en forma de texto]”_

- Al final del enunciado generado, añadirás este párrafo:

  _“No modifique por ahora las anotaciones @Transient de las clases. Modificar las interfaces [repositorios de entidades nuevas a implementar por el alumno (rojas), no siendo enumerados] alojada en el mismo paquete para que extienda a CrudRepository.”_

### RELACIONES ENTRE ENTIDADES

Una vez que tenemos la extensión funcional completa del nuevo examen, el diagrama UML y las restricciones de cada atributo, pasaremos a generar el ejercicio “RELACIONES ENTRE ENTIDADES” del examen que estamos creando, es decir, la implementación de las relaciones entre las entidades correspondientes.

Quiero que en base a la lógica de la extensión funcional, el diagrama UML y las restricciones que me has pasado y que ya tenemos, recordando todo el contexto e información proporcionada previa, describirás en detalle las relaciones a implementar por el alumno entre las entidades descritas anteriormente, es decir, entre las clases rojas. Para ello, se te adjunta un archivo md llamado “relationships_between_entities_examples_previous_exams” con ejemplos de exámenes anteriores ya realizados.

Deberá cumplir estos requisitos:

- Lo que vamos a proporcionar al alumno es un proyecto real que tendrá que manipular, por lo que los atributos de las nuevas clases tendrán anotaciones @Transient, que deberán eliminarse en este ejercicio. Esto se debe indicar explícitamente en este ejercicio.

- Las explicaciones tendrán que ser parecidas a los ejemplos que te he pasado en el archivo md.

- Se debe especificar la direccionalidad de las relaciones a implementar y las entidades implicadas en cada una de ellas.

- Se debe indicar que las relaciones deberán corresponderse con lo indicado en el diagrama UML proporcionado al alumno.

- Se debe indicar el nombre del atributo que identificará a la relación y la clase en la que tendrá que estar, en el caso en el que proceda.

- Se debe indicar que deberá implementar correctamente la cardinalidad de la relación, poniendo ejemplos simples de la relación actual para que se entienda bien.

- El enunciado deberá seguir la siguiente sintaxis:

  _“Elimine las anotaciones @Transient de los métodos y atributos que las tengan en las entidades creadas en el ejercicio anterior, (así como del atributo [atributo] de la clase [clase]). Se pide crear las siguientes relaciones entre las entidades:”_

  _“Además, se pide crear dos relaciones [direccionalidad] desde “[clase origen]” hacia “[clase destino]” que representen las que aparecen en el diagrama UML, tenga en cuenta la cardinalidad que tienen usando como nombre de los atributos “[nombre de atributo] ” y “[nombre de atributo]” en la clase “[clase]”. Debe asegurarse de que las relaciones expresan adecuadamente la cardinalidad que muestra el diagrama UML, por ejemplo, algunos atributos pueden ser nulos puesto que la cardinalidad es 0..n pero otros no, porque su cardinalidad en el extremo navegable de la relación es 1..n.”_
