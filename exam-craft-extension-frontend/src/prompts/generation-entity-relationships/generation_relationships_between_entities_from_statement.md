# PROMPT COMPLETO PARA GENERACIÓN DE RELACIONES ENTRE ENTIDADES A PARTIR DE UN ENUNCIADO CONCRETO

## Recursos a proporcionar:

- `relationships_between_entities_examples_previous_exams.md`

## Prompt a utilizar:

Nuestra misión es generar, a partir de un enunciado dado, el ejercicio de un examen, tomando el rol de profesores para una asignatura llamada Diseño y Pruebas, para evaluar los conocimientos de los alumnos sobre mapeo objeto relacional en JPA, manejo de estas entidades y base de datos, entre otras más. Concretamente te pasaré el enunciado y el diagrama UML en código Mermaid que lo acompaña, elementos en los que te tendrás que basar para proporcionarme la solución, pero antes, te daré información de contexto que necesitarás como recurso y entender mejor qué características tiene este examen:

- Hay que tomar el rol de profesor siempre, estamos generando un examen, hay que ponerse en los zapatos del profesorado.
- Tenemos dos tipos de exámenes, uno enfocado a una clínica veterinaria y otro al juego del ajedrez.
- Respecto al diagrama UML:

  -     Concepto de colores de clases:

    - **Clases negras**: El núcleo del sistema. Clases estables que se usan como contexto, pero que quedan fuera de la tarea de implementación.
    - **Clases rojas**: La tarea principal del alumno, se deben crear desde 0. Las clases vienen creadas pero su contenido está vacío.

    - Las clases negras son la base de la que partimos siempre en todos los exámenes, el dominio común a todos los exámenes dependiendo de qué tipo (clínica o ajedrez) de examen estemos generando y las rojas, pueden variar según la extensión funcional que se le añada.

  - Relaciones, cardinalidad y direccionalidad:

    - Relaciones rojas entre clases rojas: el alumno deberá añadir el atributo con su anotación de relación correspondiente.

    - Tendremos relaciones únicamente unidireccionales.

    - La cardinalidad podrá ser de 1..1, 1, 0..1, 0..n, 1..n. Las relaciones muchos a muchos se omitirán en todos los casos.

- Límite de 2 entidades de color rojo, es decir, a implementar por completo por el alumno, debido al tiempo disponible para realizar el examen.

Sabiendo y entendiendo esto a fondo, basándote y siguiendo la lógica del enunciado y el diagrama UML en código Mermaid que te proporciono en la sección de contexto de este mensaje, quiero que me generes el ejercicio “RELACIONES ENTRE ENTIDADES” del examen, es decir, describirás en detalle las relaciones a implementar por el alumno entre las distintas entidades, es decir, entre las clases rojas. Para ello, se te adjunta un archivo md llamado “relationships_between_entities_examples_previous_exams” con ejemplos de exámenes anteriores ya realizados.

Deberá cumplir estos requisitos:

- Lo que vamos a proporcionar al alumno es un proyecto real que tendrá que manipular, por lo que los atributos de las nuevas clases tendrán anotaciones @Transient, que deberán eliminarse en este ejercicio. Esto se debe indicar explícitamente en este ejercicio.

- Deberás indicar las relaciones a implementar de las entidades ROJAS, es decir, de las entidades que se han añadido a la nueva funcionalidad y que el alumno deberá implementar, evitando dejar ninguna relación atrás. Puedes apoyarte en el apartado del código Mermaid donde se definen todas ellas.

- Las explicaciones tendrán que ser parecidas a los ejemplos que te he pasado en el archivo md.

- Se debe especificar la direccionalidad de las relaciones a implementar y las entidades implicadas en cada una de ellas.

- Se debe indicar que las relaciones deberán corresponderse con lo indicado en el diagrama UML proporcionado al alumno.

- Se debe indicar el nombre del atributo que identificará a la relación y la clase en la que tendrá que estar, en el caso en el que proceda.

- Se debe indicar que deberá implementar correctamente la cardinalidad de la relación, poniendo ejemplos simples de la relación actual para que se entienda bien.

- Omite en tu respuesta cualquier anotación para los alumnos y criterios de evaluación, solo devuelve lo que se te especifica.

- El enunciado deberá seguir la siguiente sintaxis:

  _“Elimine las anotaciones @Transient de los métodos y atributos que las tengan en las entidades creadas en el ejercicio anterior, (así como del atributo [atributo] de la clase [clase]). Se pide crear las siguientes relaciones entre las entidades:”_

  _“Además, se pide crear dos relaciones [direccionalidad] desde “[clase origen]” hacia “[clase destino]” que representen las que aparecen en el diagrama UML, tenga en cuenta la cardinalidad que tienen usando como nombre de los atributos “[nombre de atributo] ” y “[nombre de atributo]” en la clase “[clase]”. Debe asegurarse de que las relaciones expresan adecuadamente la cardinalidad que muestra el diagrama UML, por ejemplo, algunos atributos pueden ser nulos puesto que la cardinalidad es 0..n pero otros no, porque su cardinalidad en el extremo navegable de la relación es 1..n.”_
